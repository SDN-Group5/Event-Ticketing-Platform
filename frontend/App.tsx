import React, { useState } from 'react';
import { NavItem, ScreenName } from './types';
import { ClientHome, SearchResults, EventDetails, ZoneSelection, Checkout, PaymentSuccess, UserProfile, TicketModal } from './views/ClientViews';
import { Login, OTP, ResetPassword, LogoutModal } from './views/AuthViews';
import { OrganizerHub, OrganizerAdmin, CreateEvent, AttendeeList, OrganizerAnalytics } from './views/OrganizerViews';
import { AdminPayouts, AdminEventQueue, AdminUsers, LayoutEditor } from './views/AdminViews';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('ClientHome');
  const [showNav, setShowNav] = useState(true);

  // Navigation configuration for the demo sidebar
  const navItems: NavItem[] = [
    { name: 'Home', screen: 'ClientHome', icon: 'home', category: 'Client' },
    { name: 'Search', screen: 'SearchResults', icon: 'search', category: 'Client' },
    { name: 'Event', screen: 'EventDetails', icon: 'event', category: 'Client' },
    { name: 'Zone', screen: 'ZoneSelection', icon: 'grid_view', category: 'Client' },
    { name: 'Checkout', screen: 'Checkout', icon: 'shopping_cart', category: 'Client' },
    { name: 'Success', screen: 'PaymentSuccess', icon: 'check_circle', category: 'Client' },
    { name: 'Profile', screen: 'UserProfile', icon: 'person', category: 'Client' },
    { name: 'Ticket Modal', screen: 'TicketModal', icon: 'confirmation_number', category: 'Client' },
    
    { name: 'Login', screen: 'Login', icon: 'login', category: 'Auth' },
    { name: 'OTP', screen: 'OTP', icon: 'pin', category: 'Auth' },
    { name: 'Reset', screen: 'ResetPassword', icon: 'lock_reset', category: 'Auth' },
    { name: 'Logout', screen: 'LogoutModal', icon: 'logout', category: 'Auth' },

    { name: 'Org Hub', screen: 'OrganizerHub', icon: 'dashboard', category: 'Organizer' },
    { name: 'Org Admin', screen: 'OrganizerAdmin', icon: 'admin_panel_settings', category: 'Organizer' },
    { name: 'Create Evt', screen: 'CreateEvent', icon: 'add_circle', category: 'Organizer' },
    { name: 'Attendees', screen: 'AttendeeList', icon: 'group', category: 'Organizer' },
    { name: 'Analytics', screen: 'OrganizerAnalytics', icon: 'insights', category: 'Organizer' },

    { name: 'Payouts', screen: 'AdminPayouts', icon: 'payments', category: 'Admin' },
    { name: 'Queue', screen: 'AdminEventQueue', icon: 'queue', category: 'Admin' },
    { name: 'Users', screen: 'AdminUsers', icon: 'manage_accounts', category: 'Admin' },
    { name: 'Editor', screen: 'LayoutEditor', icon: 'edit_square', category: 'Admin' },
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      // Client
      case 'ClientHome': return <ClientHome />;
      case 'SearchResults': return <SearchResults />;
      case 'EventDetails': return <EventDetails />;
      case 'ZoneSelection': return <ZoneSelection />;
      case 'Checkout': return <Checkout />;
      case 'PaymentSuccess': return <PaymentSuccess />;
      case 'UserProfile': return <UserProfile />;
      case 'TicketModal': return <div className="relative"><ClientHome /><TicketModal /></div>; // Overlay demo

      // Auth
      case 'Login': return <Login />;
      case 'OTP': return <OTP />;
      case 'ResetPassword': return <ResetPassword />;
      case 'LogoutModal': return <div className="relative"><UserProfile /><LogoutModal /></div>; // Overlay demo

      // Organizer
      case 'OrganizerHub': return <OrganizerHub />;
      case 'OrganizerAdmin': return <OrganizerAdmin />;
      case 'CreateEvent': return <CreateEvent />;
      case 'AttendeeList': return <AttendeeList />;
      case 'OrganizerAnalytics': return <OrganizerAnalytics />;

      // Admin
      case 'AdminPayouts': return <AdminPayouts />;
      case 'AdminEventQueue': return <AdminEventQueue />;
      case 'AdminUsers': return <AdminUsers />;
      case 'LayoutEditor': return <LayoutEditor />;
      
      default: return <ClientHome />;
    }
  };

  return (
    <div className="relative">
      {renderScreen()}
      
      {/* Demo Navigation Toggle */}
      <button 
        onClick={() => setShowNav(!showNav)}
        className="fixed bottom-4 right-4 z-[100] p-3 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 text-white hover:bg-white/20 transition-all"
        title="Toggle Demo Menu"
      >
        <span className="material-symbols-outlined">{showNav ? 'close' : 'menu'}</span>
      </button>

      {/* Demo Navigation Drawer */}
      {showNav && (
        <div className="fixed bottom-20 right-4 z-[99] bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl w-64 max-h-[80vh] overflow-y-auto">
          <div className="text-xs font-bold text-gray-400 uppercase mb-2 px-2">Demo Navigation</div>
          <div className="space-y-6">
            {['Client', 'Auth', 'Organizer', 'Admin'].map(cat => (
              <div key={cat}>
                <div className="text-[10px] font-bold text-[#8655f6] uppercase mb-2 px-2 tracking-wider">{cat} Screens</div>
                <div className="grid grid-cols-2 gap-2">
                  {navItems.filter(item => item.category === cat).map(item => (
                    <button
                      key={item.screen}
                      onClick={() => setCurrentScreen(item.screen)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs transition-all ${currentScreen === item.screen ? 'bg-[#8655f6] text-white shadow-lg' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                    >
                      <span className="material-symbols-outlined text-lg mb-1">{item.icon}</span>
                      <span className="truncate w-full text-center">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;