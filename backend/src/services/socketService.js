const { getIO } = require('../config/socket');

/**
 * Emit order status update to user's room
 */
function emitOrderStatusUpdate(userId, orderId, status) {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('order:statusUpdated', {
      orderId,
      status,
      updatedAt: new Date().toISOString(),
    });
    console.log(`📡 Emitted order:statusUpdated to user:${userId} — Order #${orderId} → ${status}`);
  } catch (error) {
    console.error('Socket emit error:', error.message);
  }
}

/**
 * Emit new order notification to admin room
 */
function emitNewOrderNotification(order) {
  try {
    const io = getIO();
    io.to('admin').emit('order:new', {
      orderId: order.id,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    });
    console.log(`📡 Emitted order:new to admin room — Order #${order.id}`);
  } catch (error) {
    console.error('Socket emit error:', error.message);
  }
}

module.exports = {
  emitOrderStatusUpdate,
  emitNewOrderNotification,
};
