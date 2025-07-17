// Admin OTP and SMS Templates

export interface AdminOTPSMSData {
  adminName: string;
  otp: string;
  expiryMinutes: number;
}

export interface AdminSMSData {
  adminName: string;
  department?: string;
}

export function generateAdminOTPSMS(data: AdminOTPSMSData): string {
  const { adminName, otp, expiryMinutes } = data;
  
  return `ADMIN ALERT: ${adminName}, your secure verification code is: ${otp}. Expires in ${expiryMinutes} mins. Keep confidential. - Admin Portal`;
}

export function generateAdminSecurityAlertSMS(data: AdminSMSData & { activity: string; location?: string }): string {
  const { adminName, activity, location } = data;
  const locationText = location ? ` from ${location}` : '';
  
  return `SECURITY ALERT: ${adminName}, ${activity} detected on your admin account${locationText}. If this wasn't you, secure your account immediately.`;
}

export function generateAdminSystemAlertSMS(adminName: string, alertType: string, severity: 'low' | 'medium' | 'high' | 'critical'): string {
  const severityEmoji = {
    low: '💙',
    medium: '💛', 
    high: '🧡',
    critical: '🔴'
  };

  return `${severityEmoji[severity]} SYSTEM ALERT: ${adminName}, ${alertType} requires admin attention. Check the admin dashboard immediately for details.`;
}

export function generateAdminUserReportSMS(adminName: string, reportType: string, userType: 'customer' | 'vendor', userName: string): string {
  return `USER REPORT: ${adminName}, new ${reportType} filed against ${userType} "${userName}". Review required in admin panel under user management.`;
}

export function generateAdminPerformanceReportSMS(adminName: string, period: string, metrics: { users: number; orders: number; revenue: number }): string {
  const { users, orders, revenue } = metrics;
  return `PLATFORM REPORT: ${adminName}, ${period} summary - ${users} new users, ${orders} orders, ₹${revenue} revenue. Full report in admin dashboard.`;
}

export function generateAdminMaintenanceNotificationSMS(adminName: string, maintenanceType: string, scheduledTime: string): string {
  return `MAINTENANCE ALERT: ${adminName}, ${maintenanceType} scheduled for ${scheduledTime}. Prepare for potential system downtime. Check admin panel for details.`;
}

export function generateAdminBackupStatusSMS(adminName: string, status: 'success' | 'failed', backupType: string): string {
  const statusEmoji = status === 'success' ? '✅' : '❌';
  return `${statusEmoji} BACKUP ALERT: ${adminName}, ${backupType} backup ${status}. ${status === 'failed' ? 'Immediate action required!' : 'System data secured.'} Check logs.`;
}

export function generateAdminPasswordChangeNotificationSMS(adminName: string): string {
  return `SECURITY UPDATE: ${adminName}, your admin password has been successfully changed. If this wasn't you, contact security team immediately.`;
}
