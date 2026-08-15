import { Link, usePage } from '@inertiajs/react';
import {
    Award,
    BarChart3,
    CalendarDays,
    Camera,
    ClipboardList,
    CreditCard,
    Footprints,
    Images,
    LayoutGrid,
    PackageCheck,
    Route,
    ScanLine,
    Star,
    Tags,
    Ticket,
    Timer,
    Trophy,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { checkIn, racePack } from '@/routes/admin';
import { index as bibsIndex } from '@/routes/admin/bibs';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as certificatesIndex } from '@/routes/admin/certificates';
import { index as eventsIndex } from '@/routes/admin/events';
import { index as galleryIndex } from '@/routes/admin/gallery';
import { index as guestStarsIndex } from '@/routes/admin/guest-stars';
import { index as paymentsIndex } from '@/routes/admin/payments';
import { index as photosIndex } from '@/routes/admin/photos';
import { index as registrationsIndex } from '@/routes/admin/registrations';
import { index as reportsIndex } from '@/routes/admin/reports';
import { index as resultsIndex } from '@/routes/admin/results';
import { index as routeMapsIndex } from '@/routes/admin/route-maps';
import { index as runnersIndex } from '@/routes/admin/runners';
import { index as timingIndex } from '@/routes/admin/timing';
import type { NavGroup, NavItem } from '@/types';

const footerNavItems: NavItem[] = [
   
];

export function AppSidebar() {
    const user = usePage().props.auth.user;

    const flowGroups: NavGroup[] = user.is_admin
        ? [
              {
                  title: 'Pendaftaran',
                  items: [
                      {
                          title: 'Manajemen Event',
                          href: eventsIndex().url,
                          icon: CalendarDays,
                      },
                      {
                          title: 'Guest Star',
                          href: guestStarsIndex().url,
                          icon: Star,
                      },
                      {
                          title: 'Galeri Event',
                          href: galleryIndex().url,
                          icon: Images,
                      },
                      {
                          title: 'Rute',
                          href: routeMapsIndex().url,
                          icon: Route,
                      },
                      {
                          title: 'Kategori',
                          href: categoriesIndex().url,
                          icon: Tags,
                      },
                      {
                          title: 'Pendaftaran',
                          href: registrationsIndex().url,
                          icon: ClipboardList,
                      },
                      {
                          title: 'Pembayaran',
                          href: paymentsIndex().url,
                          icon: CreditCard,
                      },
                      {
                          title: 'Runner',
                          href: runnersIndex().url,
                          icon: Footprints,
                      },
                      {
                          title: 'Manajemen BIB',
                          href: bibsIndex().url,
                          icon: Ticket,
                      },
                  ],
              },
              {
                  title: 'Race Day',
                  items: [
                        {
                            title: 'Race Pack',
                            href: racePack().url,
                            icon: PackageCheck,
                        },
                        {
                            title: 'Check-in',
                            href: checkIn().url,
                            icon: ScanLine,
                        },
                      {
                          title: 'Timing',
                          href: timingIndex().url,
                          icon: Timer,
                      },
                  ],
              },
              {
                  title: 'Pasca Race',
                  items: [
                      {
                          title: 'Fotografi',
                          href: photosIndex().url,
                          icon: Camera,
                      },
                      {
                          title: 'Hasil',
                          href: resultsIndex().url,
                          icon: Trophy,
                      },
                      {
                          title: 'Sertifikat',
                          href: certificatesIndex().url,
                          icon: Award,
                      },
                      {
                          title: 'Laporan',
                          href: reportsIndex().url,
                          icon: BarChart3,
                      },
                  ],
              },
          ]
        : [];

    const dashboardGroup: NavGroup = {
        title: 'Platform',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={[dashboardGroup, ...flowGroups]} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
