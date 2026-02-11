const getHealthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ParkFinder Realtime Service is RUNNING',
    timestamp: new Date().toISOString()
  });
};

module.exports = { getHealthCheck };