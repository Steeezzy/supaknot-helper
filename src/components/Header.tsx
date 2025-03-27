
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, Plus } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onAddClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header = ({ 
  title, 
  onAddClick, 
  showBackButton = false,
  onBackClick 
}: HeaderProps) => {
  const { user, signOut } = useAuth();
  
  return (
    <header className="bg-green-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBackClick}
                className="mr-2 text-white hover:bg-green-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Button>
            )}
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold">MealBuddy</h1>
            </Link>
            {title && <h2 className="ml-4 text-lg">{title}</h2>}
          </div>

          <div className="flex items-center space-x-2">
            {onAddClick && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onAddClick}
                className="bg-white text-green-500 hover:bg-gray-100 border-white"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Meals
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-green-600"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        {!title && (
          <p className="text-sm text-white opacity-90 mt-1">Affordable, healthy meals near you</p>
        )}
      </div>
    </header>
  );
};

export default Header;
