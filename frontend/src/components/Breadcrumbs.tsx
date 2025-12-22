import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const location = useLocation();

  // Auto-generate breadcrumbs from pathname if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Trang chủ', path: '/' }];

    let currentPath = '';
    pathnames.forEach((name, index) => {
      currentPath += `/${name}`;
      
      // Skip numeric IDs (like /tours/123)
      if (!isNaN(Number(name))) {
        return;
      }

      const label = name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Don't add last item if it's the current page (no link)
      if (index === pathnames.length - 1) {
        breadcrumbs.push({ label });
      } else {
        breadcrumbs.push({ label, path: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index === 0 ? (
                <Link
                  to={item.path || '/'}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <HomeIcon className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
                  {isLast ? (
                    <span className="text-gray-900 font-medium">{item.label}</span>
                  ) : (
                    <Link
                      to={item.path || '#'}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

