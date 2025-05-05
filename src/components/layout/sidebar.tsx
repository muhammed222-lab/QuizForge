import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  subItems?: { label: string; href: string }[];
}

interface SidebarProps {
  navItems: NavItem[];
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  isOpen = true,
  onToggle,
  className,
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  const toggleSubMenu = (href: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const sidebarVariants = {
    open: { width: '240px', transition: { duration: 0.3 } },
    closed: { width: '64px', transition: { duration: 0.3 } },
  };

  const textVariants = {
    open: { opacity: 1, x: 0, display: 'block', transition: { delay: 0.1, duration: 0.2 } },
    closed: { opacity: 0, x: -10, transitionEnd: { display: 'none' }, transition: { duration: 0.2 } },
  };

  return (
    <motion.aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white shadow-md transition-all md:relative',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        className
      )}
      initial={isOpen ? 'open' : 'closed'}
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
    >
      <div className="flex h-full flex-col">
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-600 text-white">
              Q
            </div>
            <motion.span
              className="text-lg font-bold text-green-700"
              variants={textVariants}
            >
              QuizForge
            </motion.span>
          </Link>
          <motion.button
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 focus:outline-none"
            onClick={onToggle}
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            )}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => (
            <div key={item.href}>
              {item.subItems ? (
                <>
                  <motion.button
                    className={cn(
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                      location.pathname.startsWith(item.href)
                        ? 'bg-green-50 text-green-700'
                        : 'text-black hover:bg-gray-50 hover:text-green-600'
                    )}
                    onClick={() => toggleSubMenu(item.href)}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mr-3 flex-shrink-0 text-gray-500">{item.icon}</span>
                    <motion.span className="flex-1" variants={textVariants}>
                      {item.label}
                    </motion.span>
                    {item.subItems && (
                      <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={cn(
                          "h-4 w-4 text-gray-500 transition-transform",
                          expandedItems[item.href] && "rotate-90"
                        )}
                        variants={textVariants}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </motion.svg>
                    )}
                  </motion.button>
                  <AnimatePresence>
                    {expandedItems[item.href] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-6 mt-1 space-y-1"
                      >
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            to={subItem.href}
                            className={cn(
                              'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                              location.pathname === subItem.href
                                ? 'bg-green-50 text-green-700'
                                : 'text-black hover:bg-gray-50 hover:text-green-600'
                            )}
                          >
                            <motion.span
                              className="flex-1"
                              variants={textVariants}
                              whileHover={{ x: 3 }}
                            >
                              {subItem.label}
                            </motion.span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                    location.pathname === item.href
                      ? 'bg-green-50 text-green-700'
                      : 'text-black hover:bg-gray-50 hover:text-green-600'
                  )}
                >
                  <motion.div
                    className="mr-3 flex-shrink-0 text-gray-500"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    {item.icon}
                  </motion.div>
                  <motion.span className="flex-1" variants={textVariants}>
                    {item.label}
                  </motion.span>
                  {location.pathname === item.href && (
                    <motion.div
                      className="absolute left-0 h-full w-1 rounded-r-md bg-green-500"
                      layoutId="sidebar-indicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4">
          <motion.div
            className="flex items-center space-x-2 text-sm text-gray-500"
            variants={textVariants}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Help & Support</span>
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
};
