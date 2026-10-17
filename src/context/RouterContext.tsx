import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  pathname: string;
  search: string;
  queryParams: Record<string, string>;
  navigate: (to: string, replace?: boolean) => void;
}

const RouterContext = createContext<RouterContextType>({
  pathname: window.location.pathname,
  search: window.location.search,
  queryParams: {},
  navigate: () => {},
});

export const useRouter = () => useContext(RouterContext);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState(window.location.pathname || '/');
  const [search, setSearch] = useState(window.location.search || '');

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname || '/');
      setSearch(window.location.search || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string, replace: boolean = false) => {
    if (replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }
    const [newPath, newQuery] = to.split('?');
    setPathname(newPath || '/');
    setSearch(newQuery ? `?${newQuery}` : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const queryParams: Record<string, string> = {};
  if (search) {
    const params = new URLSearchParams(search);
    params.forEach((value, key) => {
      queryParams[key] = value;
    });
  }

  return (
    <RouterContext.Provider value={{ pathname, search, queryParams, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const Link: React.FC<{
  to: string;
  className?: string;
  children: React.ReactNode;
  replace?: boolean;
  onClick?: () => void;
  title?: string;
}> = ({ to, className, children, replace, onClick, title }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // Allow browser tab open
    e.preventDefault();
    if (onClick) onClick();
    navigate(to, replace);
  };

  return (
    <a href={to} onClick={handleClick} className={className} title={title}>
      {children}
    </a>
  );
};
