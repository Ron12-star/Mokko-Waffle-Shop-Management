import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { MenuService } from '../menu/menu.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly menuService: MenuService,
  ) {}

  private getWeekDays(now: Date) {
    const currentDay = now.getDay();
    // Monday is start of week: Monday=1 ... Sunday=0 (diff 6)
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dayNames.map((name, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const isToday = d.toDateString() === now.toDateString();
      return {
        day: name,
        dateKey: d.toLocaleDateString('en-CA'),
        date: isToday ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday,
        count: 0,
        revenue: 0,
        smallQty: 0,
        bigQty: 0,
        sales: 0,
        orders: 0,
      };
    });
  }

  async getOverviewStats() {
    const orders = await this.ordersService.getAllOrders();
    const now = new Date();
    const weekDays = this.getWeekDays(now);

    let totalRevenue = 0;
    let cashSales = 0;
    let upiSales = 0;
    let wafflesSold = 0;
    let dessertsSold = 0;
    let beveragesSold = 0;

    orders.forEach(order => {
      const orderTotal = order.summary?.total || 0;
      totalRevenue += orderTotal;

      if (order.paymentMethod === 'cash') cashSales += orderTotal;
      else if (order.paymentMethod === 'upi') upiSales += orderTotal;
      else {
        cashSales += Math.round(orderTotal / 2);
        upiSales += Math.round(orderTotal / 2);
      }

      const oDate = order.createdAt ? new Date(order.createdAt) : now;
      const oDateKey = oDate.toLocaleDateString('en-CA');
      const targetDay = weekDays.find(wd => wd.dateKey === oDateKey);
      if (targetDay) {
        targetDay.sales += orderTotal;
        targetDay.orders += 1;
      }

      order.items?.forEach(item => {
        const lowerName = item.name.toLowerCase();
        const qty = Number(item.qty) || 1;
        if (lowerName.includes('waffle')) {
          wafflesSold += qty;
          if (targetDay) targetDay.count += qty;
        } else if (lowerName.includes('brownie') || lowerName.includes('mousse') || lowerName.includes('dessert')) {
          dessertsSold += qty;
        } else if (lowerName.includes('shake') || lowerName.includes('coffee') || lowerName.includes('latte')) {
          beveragesSold += qty;
        } else {
          wafflesSold += qty;
        }
      });
    });

    const totalOrders = orders.length;
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const weeklySales = weekDays.map(wd => ({
      day: wd.day,
      date: wd.date,
      sales: wd.sales,
      orders: wd.orders,
      waffles: wd.count,
    }));

    const monthlySales = [
      { name: 'Week 1', sales: 0 },
      { name: 'Week 2', sales: 0 },
      { name: 'Week 3', sales: 0 },
      { name: 'Week 4 (Current)', sales: totalRevenue },
    ];

    return {
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        wafflesSold,
        dessertsSold,
        beveragesSold,
        aov,
        cashSales,
        upiSales,
        target: 150000,
        weeklySales,
        monthlySales,
      },
    };
  }

  async getDailyWaffleAnalytics() {
    const orders = await this.ordersService.getAllOrders();
    const now = new Date();
    const weekDays = this.getWeekDays(now);

    let todayWafflesSold = 0;
    let todayWaffleRevenue = 0;
    let todayTotalRevenue = 0;
    let totalSmall = 0;
    let totalBig = 0;
    const flavorMap: Record<string, { name: string; emoji: string; soldToday: number }> = {};
    const hourMap: Record<number, number> = {};

    orders.forEach(order => {
      const oDate = order.createdAt ? new Date(order.createdAt) : now;
      const oDateKey = oDate.toLocaleDateString('en-CA');
      const isOrderToday = oDate.toDateString() === now.toDateString();
      const targetDay = weekDays.find(wd => wd.dateKey === oDateKey);

      if (isOrderToday) {
        todayTotalRevenue += order.summary?.total || 0;
      }

      order.items?.forEach(item => {
        const lowerName = item.name.toLowerCase();
        const isWaffle = lowerName.includes('waffle') || (item as any).category === 'Waffles';
        if (isWaffle) {
          const qty = Number(item.qty) || 1;
          const rev = (Number(item.price) || 0) * qty;
          const isSmall = lowerName.includes('small') || lowerName.includes('(s)') || (item as any).size === 'small';
          const isBig = !isSmall;

          if (targetDay) {
            targetDay.count += qty;
            targetDay.revenue += rev;
            if (isSmall) targetDay.smallQty += qty;
            else targetDay.bigQty += qty;
          }

          if (isOrderToday) {
            todayWafflesSold += qty;
            todayWaffleRevenue += rev;
            if (isSmall) totalSmall += qty;
            else totalBig += qty;

            const baseFlavor = item.name.replace(/\s*\((Small|Big|s|b)\)\s*/gi, '').trim();
            if (!flavorMap[baseFlavor]) {
              flavorMap[baseFlavor] = {
                name: baseFlavor,
                emoji: item.emoji || '🧇',
                soldToday: 0,
              };
            }
            flavorMap[baseFlavor].soldToday += qty;

            const hr = oDate.getHours();
            hourMap[hr] = (hourMap[hr] || 0) + qty;
          }
        }
      });
    });

    const dailyTrend = weekDays.map(wd => ({
      day: wd.day,
      date: wd.date,
      count: wd.count,
      revenue: wd.revenue,
      smallQty: wd.smallQty,
      bigQty: wd.bigQty,
    }));

    const topFlavors = Object.values(flavorMap)
      .sort((a, b) => b.soldToday - a.soldToday)
      .map((f, idx) => ({
        name: f.name,
        soldToday: f.soldToday,
        emoji: f.emoji,
        trend: idx === 0 ? '🔥 Best Seller' : '⭐ Popular',
      }));

    const totalSizes = totalSmall + totalBig;
    const sizeDistribution = {
      small: {
        count: totalSmall,
        percent: totalSizes > 0 ? Math.round((totalSmall / totalSizes) * 100) : 0,
        label: 'Small Size',
      },
      big: {
        count: totalBig,
        percent: totalSizes > 0 ? Math.round((totalBig / totalSizes) * 100) : 0,
        label: 'Big Size',
      },
    };

    let peakWaffleHour = '--';
    let maxHourCount = 0;
    for (const [hrStr, cnt] of Object.entries(hourMap)) {
      if (cnt > maxHourCount) {
        maxHourCount = cnt;
        const hr = parseInt(hrStr, 10);
        const period = hr >= 12 ? 'PM' : 'AM';
        const displayHr = hr % 12 === 0 ? 12 : hr % 12;
        const nextHr = (hr + 1) % 12 === 0 ? 12 : (hr + 1) % 12;
        const nextPeriod = (hr + 1) >= 12 ? 'PM' : 'AM';
        peakWaffleHour = `${String(displayHr).padStart(2, '0')}:00 ${period} - ${String(nextHr).padStart(2, '0')}:00 ${nextPeriod}`;
      }
    }

    const waffleSharePercentage = todayTotalRevenue > 0
      ? Math.min(100, Math.round((todayWaffleRevenue / todayTotalRevenue) * 100))
      : (todayWafflesSold > 0 ? 100 : 0);

    return {
      success: true,
      waffleAnalytics: {
        todayWafflesSold,
        todayWaffleRevenue,
        waffleSharePercentage,
        dailyTrend,
        topFlavors,
        sizeDistribution,
        peakWaffleHour,
      },
    };
  }
}
