import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_VEHICLES } from '../constants';
import { useLanguage } from '../LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  // Get the latest 2 vehicles from inventory as 'Recent Posts'
  const recentInventoryPosts = [...MOCK_VEHICLES].reverse().slice(0, 2);

  const SOCIAL_LINKS = [
    { icon: 'fa-facebook-f', color: '#3b5998' }, // Facebook Blue
    { icon: 'fa-x-twitter', color: '#000000' },
    { icon: 'fa-instagram', color: '#e4405f' },
    { icon: 'fa-youtube', color: '#ff0000' },
    { icon: 'fa-vimeo-v', color: '#1ab7ea' },
    { icon: 'fa-linkedin-in', color: '#0077b5' },
    { icon: 'fa-pinterest-p', color: '#bd081c' },
    { icon: 'fa-skype', color: '#00aff0' },
    { icon: 'fa-google-plus-g', color: '#dd4b39' }
  ];

  return (
    <footer className="text-slate-300">
      {/* Top Footer Section */}
      <div className="bg-[#3b3b3b] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Newsletter Column */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white tracking-tight">{t('footer_newsletter')}</h3>
              <p className="text-sm leading-relaxed text-slate-300">
                {t('footer_newsletter_p')}
              </p>
              <div className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full px-4 py-3 bg-white text-slate-900 border-none outline-none rounded-sm"
                />
                <button className="bg-[#c30000] text-white px-6 py-2 rounded-sm font-bold text-sm uppercase tracking-wider hover:bg-red-700 transition-colors">
                  {t('footer_subscribe')}
                </button>
              </div>
            </div>

            {/* Recent Posts Column - Dynamic Inventory Links */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white tracking-tight">{t('footer_recent')}</h3>
              <div className="space-y-6">
                {recentInventoryPosts.map((v) => (
                  <Link 
                    key={v.id} 
                    to="/inventory" 
                    className="flex gap-4 group cursor-pointer"
                  >
                    <div className="w-16 h-12 flex-shrink-0 overflow-hidden bg-slate-800 rounded-sm">
                      <img 
                        src={v.images[0]} 
                        alt={v.model} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors leading-tight">
                        Just Added: {v.year} {v.make} {v.model}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {v.trim} - Now available for ${v.price.toLocaleString()} in our inventory ...
                      </p>
                    </div>
                  </Link>
                ))}
                {recentInventoryPosts.length === 0 && (
                  <p className="text-xs text-slate-500 italic">No recent updates available.</p>
                )}
              </div>
            </div>

            {/* Contact Us Column */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white tracking-tight">{t('footer_contact')}</h3>
              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-4">
                  <i className="fa-solid fa-location-dot mt-1 text-slate-400"></i>
                  <p className="text-slate-300">
                    <span className="font-bold text-white">Address:</span> 1234 Street Name, City Name, AB 12345
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <i className="fa-solid fa-phone text-slate-400"></i>
                  <p className="text-slate-300">
                    <span className="font-bold text-white">Phone:</span> 1-800-123-4567
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <i className="fa-solid fa-envelope text-slate-400"></i>
                  <p className="text-slate-300">
                    <span className="font-bold text-white">Email:</span> sales@company.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="bg-[#333333] py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            
            {/* Branding Part */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-black tracking-tighter text-white leading-none uppercase">
                  OLDROAD AUTO
                </span>
              </div>
            </div>

            {/* Social and Navigation Part */}
            <div className="flex flex-col items-start lg:items-end gap-6">
              {/* Social Icons with Brand-Specific Animations */}
              <div className="flex flex-wrap gap-1">
                {SOCIAL_LINKS.map((item, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className="relative w-8 h-8 flex items-center justify-center bg-[#444444] text-slate-300 transition-all duration-300 rounded-sm text-xs overflow-hidden group hover:-translate-y-1 shadow-md hover:shadow-lg"
                  >
                    {/* Sliding Background: Slides from the bottom using brand color */}
                    <span 
                      className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    
                    {/* Brand Icon: Changes to white and scales up when group is hovered */}
                    <i className={`fa-brands ${item.icon} relative z-10 group-hover:text-white group-hover:scale-125 transition-all duration-300`}></i>
                  </a>
                ))}
              </div>

              {/* Nav Links */}
              <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <Link to="/" className="hover:text-white transition-colors">{t('nav_home')}</Link>
                <Link to="/about" className="hover:text-white transition-colors">{t('nav_pages')}</Link>
                <Link to="/inventory" className="hover:text-white transition-colors">{t('nav_inventory')}</Link>
                <Link to="/trade-in" className="hover:text-white transition-colors">{t('nav_services')}</Link>
                <Link to="/locations" className="hover:text-white transition-colors uppercase">{t('nav_locations')}</Link>
                <Link to="/contact" className="hover:text-white transition-colors uppercase">{t('nav_contact')}</Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute right-6 bottom-6 w-10 h-10 bg-[#1a1a1a] text-slate-400 flex items-center justify-center hover:bg-[#c30000] hover:text-white transition-all rounded-sm shadow-xl"
        >
          <i className="fa-solid fa-chevron-up text-xs"></i>
        </button>
      </div>
    </footer>
  );
};

export default Footer;