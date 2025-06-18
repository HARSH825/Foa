'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Menu, Home, Plus, Clock, User, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const links = [
    { href: '/home', label: 'Dashboard', icon: Home },
    { href: '/create', label: 'Create Interview', icon: Plus },
    { href: '/past-interview', label: 'Past Interviews', icon: Clock },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const logoutLink = { href: '/', label: 'Logout', icon: LogOut };

  return (
    <aside
      className={`h-screen bg-gradient-to-b from-[#111111] to-[#0a0a0a] text-white border-r border-gray-700/50 transition-all duration-300 ease-in-out shadow-2xl ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-800/60 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer group"
            >
              <Menu 
                size={20} 
                className="text-gray-300 group-hover:text-white transition-colors" 
              />
            </button>
            {isOpen && (
              <div className="text-lg font-semibold text-gray-200 ml-2">
                
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between p-4">
          <nav className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link key={link.href} href={link.href} className="block">
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`
                      w-full justify-start text-left transition-all duration-200 cursor-pointer group
                      ${isActive 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                        : 'hover:bg-gray-800/60 text-gray-300 hover:text-white'
                      }
                      ${!isOpen ? 'px-3 justify-center' : 'px-4'}
                      rounded-lg border-0 font-medium
                    `}
                    title={!isOpen ? link.label : ''}
                  >
                    <Icon 
                      size={18} 
                      className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}
                    />
                    {isOpen && (
                      <span className="ml-3 transition-all duration-200">
                        {link.label}
                      </span>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-700/50">
            <Link href={logoutLink.href} className="block">
              <Button
                variant="ghost"
                className={`
                  w-full justify-start text-left transition-all duration-200 cursor-pointer group
                  hover:bg-red-600/20 text-gray-300 hover:text-red-400 border border-transparent hover:border-red-600/30
                  ${!isOpen ? 'px-3 justify-center' : 'px-4'}
                  rounded-lg font-medium
                `}
                title={!isOpen ? logoutLink.label : ''}
              >
                <LogOut 
                  size={18} 
                  className="text-gray-400 group-hover:text-red-400 transition-colors"
                />
                {isOpen && (
                  <span className="ml-3 transition-all duration-200">
                    {logoutLink.label}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;