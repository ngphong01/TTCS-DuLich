// services/aiSystemManager.js - AI System Management & Automation
const prisma = require('../lib/prisma');
const { chatWithGemini } = require('./geminiChatbot');

/**
 * AI Payment Verifier
 * Tự động xác minh thanh toán và phát hiện giao dịch bất thường
 */
class AIPaymentVerifier {
  async autoVerifyPayments() {
    try {
      console.log('🔍 AI Payment Verification: Checking pending payments...');
      
      // Lấy các payment đang pending trong 24h qua
      const pendingPayments = await prisma.payment.findMany({
        where: {
          status: 'PENDING',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        include: {
          booking: {
            include: {
              user: true,
              destination: true
            }
          }
        },
        take: 50
      });

      if (pendingPayments.length === 0) {
        console.log('✅ No pending payments to verify');
        return { verified: 0, flagged: 0, autoApproved: 0 };
      }

      let verified = 0;
      let flagged = 0;
      let autoApproved = 0;

      for (const payment of pendingPayments) {
        // AI phân tích payment
        const analysis = await this.analyzePayment(payment);
        
        if (analysis.suspicious) {
          // Flag for manual review
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FLAGGED',
              notes: `AI flagged: ${analysis.reason}. Confidence: ${analysis.confidence}%`
            }
          });
          flagged++;
          console.log(`🚩 Flagged payment #${payment.id}: ${analysis.reason}`);
        } else if (analysis.canAutoApprove && analysis.confidence >= 85) {
          // Auto approve nếu confidence cao
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              notes: `AI auto-approved. Confidence: ${analysis.confidence}%`
            }
          });
          
          // Update booking status
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CONFIRMED' }
          });
          
          autoApproved++;
          console.log(`✅ Auto-approved payment #${payment.id}`);
        } else {
          verified++;
        }
      }

      console.log(`✅ Payment verification complete: ${verified} verified, ${flagged} flagged, ${autoApproved} auto-approved`);
      
      return {
        verified,
        flagged,
        autoApproved,
        total: pendingPayments.length
      };
    } catch (error) {
      console.error('❌ AI Payment Verification error:', error);
      return { verified: 0, flagged: 0, autoApproved: 0, error: error.message };
    }
  }

  async analyzePayment(payment) {
    try {
      const prompt = `Phân tích giao dịch thanh toán sau và đánh giá tính hợp lệ:

Thông tin thanh toán:
- ID: ${payment.id}
- Số tiền: ${payment.amount} ${payment.currency}
- Phương thức: ${payment.provider}
- Thời gian: ${payment.createdAt}
- User: ${payment.booking?.user?.email || 'N/A'}
- Tour: ${payment.booking?.destination?.name || 'N/A'}
- Booking ID: ${payment.bookingId}

Đánh giá:
1. Giao dịch có dấu hiệu bất thường không?
2. Confidence level (0-100%)
3. Có thể auto-approve không?
4. Lý do (nếu flagged)

Trả về JSON:
{
  "suspicious": false,
  "confidence": 95,
  "canAutoApprove": true,
  "reason": "Normal transaction"
}`;

      const response = await chatWithGemini(prompt, []);
      
      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Default safe response
      return {
        suspicious: false,
        confidence: 70,
        canAutoApprove: false,
        reason: 'Manual review recommended'
      };
    } catch (error) {
      console.error('Error analyzing payment:', error);
      return {
        suspicious: true,
        confidence: 0,
        canAutoApprove: false,
        reason: 'Analysis error - require manual review'
      };
    }
  }
}

/**
 * AI Fraud Detector
 * Phát hiện hành vi gian lận và đáng ngờ
 */
class AIFraudDetector {
  async detectSuspiciousActivity() {
    try {
      console.log('🔍 AI Fraud Detection: Scanning for suspicious activities...');
      
      const alerts = [];
      
      // 1. Check duplicate bookings
      const duplicateBookings = await this.checkDuplicateBookings();
      if (duplicateBookings.length > 0) {
        alerts.push(...duplicateBookings);
      }
      
      // 2. Check unusual payment patterns
      const unusualPayments = await this.checkUnusualPayments();
      if (unusualPayments.length > 0) {
        alerts.push(...unusualPayments);
      }
      
      // 3. Check suspicious user behavior
      const suspiciousUsers = await this.checkSuspiciousUsers();
      if (suspiciousUsers.length > 0) {
        alerts.push(...suspiciousUsers);
      }
      
      if (alerts.length > 0) {
        console.log(`⚠️  Detected ${alerts.length} suspicious activities`);
        // TODO: Send alert to admin
      }
      
      return { alerts, timestamp: new Date() };
    } catch (error) {
      console.error('❌ Fraud detection error:', error);
      return { alerts: [], error: error.message };
    }
  }

  async checkDuplicateBookings() {
    // Check for same user booking same tour multiple times in short time
    const recentBookings = await prisma.booking.groupBy({
      by: ['userId', 'destinationId'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24h
        }
      },
      _count: true,
      having: {
        userId: {
          _count: {
            gt: 2 // More than 2 bookings
          }
        }
      }
    });
    
    return recentBookings.map(b => ({
      type: 'DUPLICATE_BOOKING',
      severity: 'MEDIUM',
      message: `User ${b.userId} booked destination ${b.destinationId} ${b._count} times in 24h`
    }));
  }

  async checkUnusualPayments() {
    // Check for failed payments followed by successful ones
    const alerts = [];
    
    const failedPayments = await prisma.payment.findMany({
      where: {
        status: 'FAILED',
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last 1h
        }
      },
      include: {
        booking: {
          include: {
            user: true,
            destination: true,
            payment: true
          }
        }
      }
    });
    
    for (const payment of failedPayments) {
      if (payment.booking && payment.booking.payment && payment.booking.payment.status === 'COMPLETED') {
        alerts.push({
          type: 'UNUSUAL_PAYMENT_PATTERN',
          severity: 'HIGH',
          message: `Booking ${payment.bookingId} has failed payment followed by successful payment`
        });
      }
    }
    
    return alerts;
  }

  async checkSuspiciousUsers() {
    // Check for users with multiple accounts (same email pattern)
    // This is a simplified check
    return [];
  }
}

/**
 * AI Booking Manager
 * Tự động xác nhận và quản lý booking
 */
class AIBookingManager {
  async autoConfirmBookings() {
    try {
      console.log('🎫 AI Booking Manager: Auto-confirming eligible bookings...');
      
      // Lấy bookings đang PENDING với payment SUCCESS
      const eligibleBookings = await prisma.booking.findMany({
        where: {
          status: 'PENDING',
          payment: {
            status: 'SUCCESS'
          }
        },
        include: {
          user: true,
          destination: true,
          payment: true
        },
        take: 50
      });

      if (eligibleBookings.length === 0) {
        return { confirmed: 0, pending: 0 };
      }

      let confirmed = 0;
      
      for (const booking of eligibleBookings) {
        // Verify payment matches booking amount
        const payment = booking.payment;
        
        if (payment && Number(payment.amount) >= Number(booking.totalAmount)) {
          // Auto confirm
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: 'CONFIRMED',
              notes: `AI auto-confirmed. Payment verified: ${payment.amount} ${payment.currency || 'VND'}`
            }
          });
          
          confirmed++;
          console.log(`✅ Auto-confirmed booking #${booking.id}`);
          
          // TODO: Send confirmation email to user
        }
      }

      console.log(`✅ Auto-confirmed ${confirmed} bookings`);
      
      return {
        confirmed,
        pending: eligibleBookings.length - confirmed
      };
    } catch (error) {
      console.error('❌ Auto-confirm bookings error:', error);
      return { confirmed: 0, pending: 0, error: error.message };
    }
  }
}

/**
 * AI System Monitor
 * Giám sát sức khỏe hệ thống
 */
class AISystemMonitor {
  async checkSystemHealth() {
    try {
      const issues = [];
      
      // 1. Check database connection
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (error) {
        issues.push('Database connection failed');
      }
      
      // 2. Check pending payments count
      const pendingCount = await prisma.payment.count({
        where: { status: 'PENDING' }
      });
      if (pendingCount > 100) {
        issues.push(`High pending payments: ${pendingCount}`);
      }
      
      // 3. Check cancelled bookings (no FAILED status in schema)
      const cancelledBookings = await prisma.booking.count({
        where: {
          status: 'CANCELLED',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });
      if (cancelledBookings > 10) {
        issues.push(`High cancelled bookings in 24h: ${cancelledBookings}`);
      }
      
      return {
        status: issues.length === 0 ? 'healthy' : 'warning',
        issues,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'error',
        issues: [error.message],
        timestamp: new Date()
      };
    }
  }

  async optimizeDatabase() {
    try {
      console.log('🔧 Optimizing database...');
      
      // Clean up old sessions, logs, etc.
      const cleanupResults = {
        tablesOptimized: 0,
        spaceSaved: '0 MB'
      };
      
      // TODO: Implement actual optimization logic
      
      return cleanupResults;
    } catch (error) {
      console.error('❌ Database optimization error:', error);
      return { tablesOptimized: 0, spaceSaved: '0 MB', error: error.message };
    }
  }

  async generatePerformanceReport() {
    try {
      const stats = await this.getSystemStats();
      
      const prompt = `Phân tích hiệu suất hệ thống và đưa ra khuyến nghị:

Thống kê:
- Total bookings: ${stats.totalBookings}
- Pending payments: ${stats.pendingPayments}
- Completed payments: ${stats.completedPayments}
- Cancelled bookings: ${stats.cancelledBookings}
- Active users (30 days): ${stats.activeUsers}

Đánh giá:
1. Hiệu suất tổng thể
2. Điểm cần cải thiện
3. Khuyến nghị cụ thể

Trả về tóm tắt ngắn gọn (3-4 câu).`;

      const summary = await chatWithGemini(prompt, []);
      
      return {
        summary: summary.trim(),
        stats,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Performance report error:', error);
      return {
        summary: 'Unable to generate report',
        error: error.message
      };
    }
  }

  async getSystemStats() {
    const [
      totalBookings,
      pendingPayments,
      completedPayments,
      cancelledBookings,
      activeUsers
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }), // BookingStatus doesn't have FAILED
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);
    
    return {
      totalBookings,
      pendingPayments,
      completedPayments,
      cancelledBookings,
      activeUsers
    };
  }
}

module.exports = {
  AIPaymentVerifier,
  AIFraudDetector,
  AIBookingManager,
  AISystemMonitor,
};

