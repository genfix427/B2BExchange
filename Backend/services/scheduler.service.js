// services/scheduler.service.js
import cron from 'node-cron';
import stockMonitoringService from './stockMonitoring.service.js';

class SchedulerService {
  init() {
    // Schedule stock status check every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('🔄 Running scheduled stock status check...');
        const result = await stockMonitoringService.checkAndUpdateProductStatuses();
        console.log('✅ Stock check completed:', result);
      } catch (error) {
        console.error('❌ Scheduled stock check failed:', error);
      }
    });
    
    // Schedule low stock alerts every hour
    cron.schedule('0 * * * *', async () => {
      try {
        console.log('🔄 Checking for low stock alerts...');
        const alerts = await stockMonitoringService.getLowStockAlerts();
        
        if (alerts.length > 0) {
          console.log(`⚠️ Found ${alerts.length} low stock products`);
          // Here you could send email notifications or other alerts
        }
      } catch (error) {
        console.error('❌ Low stock alert check failed:', error);
      }
    });
    
    console.log('✅ Scheduler initialized');
  }
}

export default new SchedulerService();