import { useState, useEffect } from 'react';
import './live-orders.css';
import { BACKEND_URL } from './config';

function LiveOrders() {
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    connectedDevices: 0,
    activeNow: 0
  });

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 3 seconds
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      // Get system status
      const statusRes = await fetch(`${BACKEND_URL}/api/system-status`);
      const statusData = await statusRes.json();

      // Get recent orders (last 5)
      const ordersRes = await fetch(`${BACKEND_URL}/api/queue-status`);
      const ordersData = await ordersRes.json();

      // Extract recent orders from all stalls
      const allOrders = [];
      if (ordersData.queueByStall) {
        Object.values(ordersData.queueByStall).forEach(stallOrders => {
          allOrders.push(...stallOrders);
        });
      }

      // Sort by time and take last 5
      const sorted = allOrders.sort((a, b) => 
        new Date(b.time) - new Date(a.time)
      ).slice(0, 5);

      setRecentOrders(sorted);
      setStats({
        totalOrders: statusData?.totalOrders || 0,
        connectedDevices: statusData?.connectedDevices || 0,
        activeNow: ordersData?.totalPending || 0
      });
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  return (
    <div className="live-orders-container">
      <div className="live-header">
        <h1>📡 Live Order Monitor</h1>
        <div className="live-controls">
          <button 
            className="refresh-btn" 
            onClick={fetchOrders}
            title="Refresh Now"
          >
            🔄
          </button>
          <div className="live-indicator">
            <span className="pulse-dot"></span>
            <span>LIVE</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-value">{stats.connectedDevices}</div>
          <div className="stat-label">Connected Devices</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-value">{stats.activeNow}</div>
          <div className="stat-label">Active Orders</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="orders-section">
        <h2>Recent Orders (Last 30 min)</h2>
        
        {recentOrders.length === 0 ? (
          <div className="no-orders">
            <p>No recent orders</p>
            <p className="no-orders-sub">Orders will appear here in real-time</p>
          </div>
        ) : (
          <div className="orders-list">
            {recentOrders.map((order, index) => (
              <div key={index} className="order-card animate-slide-in">
                <div className="order-header">
                  <span className="order-id">#{order.orderId}</span>
                  <span className="order-time">
                    {new Date(order.time).toLocaleTimeString()}
                  </span>
                </div>
                <div className="order-body">
                  <div className="order-dish">{order.ulam}</div>
                  <div className="order-customer">👤 {order.customer}</div>
                </div>
                <div className="order-status">
                  <span className="status-badge preparing">Preparing</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="refresh-notice">
        🔄 Auto-refreshing every 3 seconds
      </div>
    </div>
  );
}

export default LiveOrders;