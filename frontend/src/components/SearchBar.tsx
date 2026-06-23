import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MdSearch } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Product } from '../../types';
import { debounce } from '../../utils/debounce';
import { formatPrice } from '../../utils/formatPrice';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProducts = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.get(`/products/search?q=${encodeURIComponent(searchQuery)}`);
      if (data.success) {
        setResults(data.data);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Search error', error);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(searchProducts, 300), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleResultClick = (slug: string) => {
    navigate(`/products/${slug}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="search-bar" ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <MdSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
        />
        {loading && <div style={{position: 'absolute', right: 15, top: 12}} className="spinner spinner-sm"></div>}
      </form>

      {isOpen && results.length > 0 && (
        <div className="search-results">
          {results.map(product => {
            const primaryImage = product.images?.[0]?.imageUrl || 'https://placehold.co/100x100/1a1a2e/00d4ff?text=No+Image';
            return (
              <div 
                key={product.id} 
                className="search-result-item"
                onClick={() => handleResultClick(product.slug)}
              >
                <img src={primaryImage} alt={product.name} />
                <div>
                  <div className="font-bold text-sm mb-xs" style={{display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{product.name}</div>
                  <div className="text-accent text-sm">{formatPrice(product.salePrice || product.price)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {isOpen && !loading && query.length >= 2 && results.length === 0 && (
        <div className="search-results p-md text-center text-muted text-sm">
          Không tìm thấy sản phẩm nào
        </div>
      )}
    </div>
  );
};

export default SearchBar;
