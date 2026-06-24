import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Product, Category, Brand, PaginatedResponse } from '../../types';
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import PriceRangeSlider from '../../components/PriceRangeSlider';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProductList: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 });
  const [sort, setSort] = useState('createdAt:DESC');

  useEffect(() => {
    // Fetch filter options once
    const fetchFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/admin/categories'),
          api.get('/admin/brands')
        ]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (brandRes.data.success) setBrands(brandRes.data.data);
      } catch (error) {
        console.error('Failed to load filters', error);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, searchQuery, selectedBrands, sort]);

  const fetchProducts = async (page: number) => {
    setLoading(true);
    try {
      let url = '/products';
      if (slug) {
        url = `/products/category/${slug}`;
      } else if (searchQuery) {
        url = `/products/search?q=${encodeURIComponent(searchQuery)}`;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort,
      });

      if (selectedBrands.length > 0) {
        params.append('brands', selectedBrands.join(','));
      }
      params.append('minPrice', priceRange.min.toString());
      params.append('maxPrice', priceRange.max.toString());

      const finalUrl = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
      
      const { data } = await api.get<PaginatedResponse<Product>>(finalUrl);
      if (data.success) {
        setProducts(data.data.products || []);
        setPagination({
          page: data.data.pagination.page,
          totalPages: data.data.pagination.totalPages
        });
      }
    } catch (error) {
      console.error('Fetch products error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandToggle = (brandId: number) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) ? prev.filter(id => id !== brandId) : [...prev, brandId]
    );
  };

  const handlePriceChange = (value: { min: number; max: number }) => {
    setPriceRange(value);
  };

  const applyPriceFilter = () => {
    fetchProducts(1);
  };

  const categoryName = slug ? categories.find(c => c.slug === slug)?.name : null;
  const title = searchQuery ? `Kết quả tìm kiếm cho: "${searchQuery}"` : categoryName || 'Tất cả sản phẩm';

  return (
    <div className="container py-xl">
      <div className="flex justify-between items-center mb-lg">
        <h1 className="text-lg font-bold">{title}</h1>
        <select 
          className="input" 
          style={{ width: 'auto' }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="createdAt:DESC">Mới nhất</option>
          <option value="price:ASC">Giá: Thấp đến Cao</option>
          <option value="price:DESC">Giá: Cao đến Thấp</option>
        </select>
      </div>

      <div className="flex gap-xl align-start">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar hide-mobile">
          <div className="filter-section">
            <h3 className="filter-title">Thương hiệu</h3>
            <div className="flex flex-col gap-sm">
              {brands.map(brand => (
                <label key={brand.id} className="filter-option">
                  <input 
                    type="checkbox" 
                    checked={selectedBrands.includes(brand.id)}
                    onChange={() => handleBrandToggle(brand.id)}
                  />
                  {brand.name}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section mt-lg">
            <h3 className="filter-title">Mức giá</h3>
            <PriceRangeSlider 
              min={0} 
              max={100000000} 
              value={priceRange} 
              onChange={handlePriceChange} 
            />
            <button className="btn btn-secondary w-full mt-md btn-sm" onClick={applyPriceFilter}>
              Áp dụng
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <LoadingSpinner />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination 
                currentPage={pagination.page} 
                totalPages={pagination.totalPages} 
                onPageChange={fetchProducts} 
              />
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>Không tìm thấy sản phẩm</h3>
              <p className="mt-sm">Vui lòng thử lại với bộ lọc hoặc từ khóa khác.</p>
              <button className="btn btn-primary mt-lg" onClick={() => {
                setSelectedBrands([]);
                setPriceRange({ min: 0, max: 100000000 });
                navigate('/products');
              }}>Xóa bộ lọc</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
