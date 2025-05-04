import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MainContentProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

export const MainContent = React.forwardRef<HTMLDivElement, MainContentProps>(
  ({ className, children, animate = true, ...props }, ref) => {

    // Simplified approach to avoid type issues
    return (
      <main
        ref={ref}
        className={cn(
          'flex-1 transition-all duration-300 bg-gray-50 overflow-y-auto',
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    );
  }
);

MainContent.displayName = 'MainContent';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  breadcrumbs,
}) => {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4 flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="inline-flex items-center">
                {index > 0 && (
                  <svg
                    className="mx-2 h-4 w-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-sm font-medium text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-black sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          )}
        </motion.div>

        {actions && (
          <motion.div
            className="mt-4 flex-shrink-0 sm:mt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {actions}
          </motion.div>
        )}
      </div>
    </div>
  );
};

interface PageSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const PageSection: React.FC<PageSectionProps> = ({
  title,
  description,
  actions,
  children,
  className,
  collapsible = false,
  defaultCollapsed = false,
  ...props
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <section
      className={cn('mb-8 rounded-lg border border-gray-200 bg-white shadow-sm', className)}
      {...props}
    >
      {(title || description || actions) && (
        <div className="flex flex-col border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-medium text-black">
                {title}
                {collapsible && (
                  <button
                    className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={cn(
                        "h-5 w-5 transition-transform",
                        isCollapsed ? "rotate-180" : ""
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {actions && (
            <div className="mt-4 flex-shrink-0 sm:mt-0">{actions}</div>
          )}
        </div>
      )}

      <motion.div
        className="p-6"
        initial={{ height: 'auto' }}
        animate={{ height: isCollapsed ? 0 : 'auto', opacity: isCollapsed ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        style={{ overflow: isCollapsed ? 'hidden' : 'visible' }}
      >
        {children}
      </motion.div>
    </section>
  );
};
