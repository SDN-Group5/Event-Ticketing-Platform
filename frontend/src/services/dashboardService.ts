import { AnalyticsAPI } from './analyticsApiService';
import { LayoutAPI } from './layoutApiService';
import { OrganizerOrderAPI, Order } from './orderApiService';
import type { EventLayout, LayoutZone } from '../types/layout';

export interface DashboardStats {
    totalEvents: number;
    ticketsSold: number;
    totalRevenue: number;
    attendees: number;
}

export interface DashboardEvent {
    eventId: string;
    name: string;
    image?: string;
    date?: string;
    ticketsSold: number;
    totalCapacity: number;
    status: string;
}

export interface DashboardData {
    stats: DashboardStats;
    events: DashboardEvent[];
    recentOrders: Order[];
}

function sumSeatMetadata(zones: LayoutZone[]) {
    let totalCapacity = 0;
    let ticketsSold = 0;
    for (const z of zones || []) {
        if (z.type === 'seats') {
            const m = (z as any).seatMetadata as { totalSeats?: number; soldSeats?: number } | undefined;
            totalCapacity += m?.totalSeats ?? 0;
            ticketsSold += m?.soldSeats ?? 0;
        } else if (z.type === 'standing') {
            totalCapacity += ((z as any).rows ?? 0) * ((z as any).seatsPerRow ?? 0);
        }
    }
    return { totalCapacity, ticketsSold };
}

function mapLayoutToEvent(layout: EventLayout): DashboardEvent {
    const { totalCapacity, ticketsSold } = sumSeatMetadata(layout.zones || []);
    let status = 'draft';
    if (layout.status === 'published') status = 'published';
    else if (layout.status === 'rejected' || layout.status === 'completed') status = layout.status;

    return {
        eventId: String(layout.eventId),
        name: layout.eventName || 'Untitled',
        image: layout.eventImage,
        date: layout.eventDate,
        ticketsSold,
        totalCapacity,
        status,
    };
}

export async function fetchDashboardData(): Promise<DashboardData> {
    const [overviewRes, layoutsRes, ordersRes, customersRes] = await Promise.allSettled([
        AnalyticsAPI.getOverview(),
        LayoutAPI.getMyLayouts(),
        OrganizerOrderAPI.listOrders(1, 5),
        OrganizerOrderAPI.listCustomers(1, 1),
    ]);

    const events: DashboardEvent[] =
        layoutsRes.status === 'fulfilled'
            ? (layoutsRes.value || []).map(mapLayoutToEvent)
            : [];

    const recentOrders: Order[] =
        ordersRes.status === 'fulfilled'
            ? ordersRes.value.data || []
            : [];

    const attendees =
        customersRes.status === 'fulfilled'
            ? customersRes.value.pagination?.total ?? 0
            : 0;

    let stats: DashboardStats;

    if (overviewRes.status === 'fulfilled' && overviewRes.value?.data?.kpi) {
        const kpi = overviewRes.value.data.kpi;
        stats = {
            totalEvents: events.length || kpi.activeEvents || 0,
            ticketsSold: kpi.ticketsSold ?? 0,
            totalRevenue: kpi.totalRevenue ?? 0,
            attendees,
        };
    } else {
        const paidOrders = recentOrders.filter((o) => o.status === 'paid');
        stats = {
            totalEvents: events.length,
            ticketsSold: paidOrders.reduce((s, o) => s + o.items.reduce((t, i) => t + i.quantity, 0), 0),
            totalRevenue: paidOrders.reduce((s, o) => s + o.totalAmount, 0),
            attendees,
        };
    }

    return { stats, events, recentOrders };
}
