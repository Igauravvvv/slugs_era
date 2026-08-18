import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus, Check, Navigation, Loader2 } from 'lucide-react';
import { useStore } from '@/store';
import type { Address } from '@/types';
import { calculateShipping } from '@/utils/shipping';
import ProductPrice from '@/components/ProductPrice';
import { getCartCompareAtTotal } from '@/lib/pricing';

export default function AddressPage() {
  const navigate = useNavigate();
  const { cart, getCartTotal, addresses, selectedAddress, addAddress, selectAddress } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  const subtotal = getCartTotal();
  const compareAtSubtotal = getCartCompareAtTotal(cart);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate phone
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      alert('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    // Validate pincode
    if (!/^\d{6}$/.test(formData.pincode)) {
      alert('Please enter a valid 6-digit PIN code');
      return;
    }
    const newAddress: Address = {
      id: Date.now().toString(),
      ...formData,
    };
    addAddress(newAddress);
    selectAddress(newAddress);
    setShowForm(false);
    setFormData({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
  };

  const getCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Reverse geocoding using OpenStreetMap Nominatim
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            
            if (data.address) {
              setFormData(prev => ({
                ...prev,
                addressLine1: data.address.road || data.address.street || '',
                city: data.address.city || data.address.town || data.address.village || '',
                state: data.address.state || '',
                pincode: data.address.postcode || '',
              }));
            }
          } catch (error) {
            console.error('Error fetching location:', error);
            alert('Could not fetch location details. Please enter manually.');
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not access your location. Please ensure location services are enabled.');
          setIsLocating(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setIsLocating(false);
    }
  };

  const proceedToPayment = () => {
    if (selectedAddress) {
      navigate('/checkout/payment');
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => {
            navigate('/cart');
            window.scrollTo(0, 0);
          }}
          className="flex items-center gap-2 text-sm text-[#888880] hover:text-[#1A1A1A] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </button>

        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-light text-[#1A1A1A] mb-8">
          Delivery Address
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          {/* Address Section */}
          <div>
            {/* Saved Addresses */}
            {addresses.length > 0 && !showForm && (
              <div className="mb-8">
                <h3 className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#888880] mb-4">
                  Saved Addresses
                </h3>
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => selectAddress(address)}
                      className={`p-5 border cursor-pointer transition-all ${
                        selectedAddress?.id === address.id
                          ? 'border-[#1A1A1A] bg-[#F9F7F5]'
                          : 'border-[#E8E4E0] hover:border-[#1A1A1A]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selectedAddress?.id === address.id
                            ? 'border-[#1A1A1A] bg-[#1A1A1A]'
                            : 'border-[#E8E4E0]'
                        }`}>
                          {selectedAddress?.id === address.id && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{address.fullName}</span>
                            {address.isDefault && (
                              <span className="text-[10px] bg-[#1A1A1A] text-white px-2 py-0.5">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#888880]">{address.phone}</p>
                          <p className="text-sm text-[#888880] mt-1">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-[#888880]">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Address Button */}
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-4 border border-dashed border-[#E8E4E0] flex items-center justify-center gap-2 text-sm text-[#888880] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
              >
                <Plus size={18} />
                Add New Address
              </button>
            )}

            {/* Address Form */}
            {showForm && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleSubmit}
                className="bg-[#F9F7F5] p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg font-medium">Add New Address</h3>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-sm text-[#888880] hover:text-[#1A1A1A]"
                  >
                    Cancel
                  </button>
                </div>

                {/* Use Current Location */}
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isLocating}
                  className="w-full mb-6 py-3 border border-[#C0132A] text-[#C0132A] flex items-center justify-center gap-2 text-sm hover:bg-[#C0132A] hover:text-white transition-colors"
                >
                  {isLocating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation size={16} />
                      Use Current Location
                    </>
                  )}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880] mb-2 block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880] mb-2 block">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880] mb-2 block">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="House/Flat No., Building, Street"
                  />
                </div>

                <div className="mt-4">
                  <label className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880] mb-2 block">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Area, Landmark (optional)"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880] mb-2 block">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880] mb-2 block">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#888880] mb-2 block">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="6-digit PIN"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    id="isDefault"
                    className="w-4 h-4 accent-[#1A1A1A]"
                  />
                  <label htmlFor="isDefault" className="text-sm text-[#888880]">
                    Set as default address
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-[#1A1A1A] text-white text-[11px] font-medium tracking-[0.17em] uppercase py-4 hover:bg-black transition-colors"
                >
                  Save Address
                </button>
              </motion.form>
            )}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, delay: 0.2 }}
            className="bg-[#F9F7F5] p-6 lg:p-8 h-fit"
          >
            <h3 className="font-display text-xl font-medium text-[#1A1A1A] mb-6">
              Order Summary
            </h3>

            {/* Items */}
            <div className="space-y-3 mb-6 pb-6 border-b border-[#E8E4E0]">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                  <span className="text-[#888880]">
                    {item.product.name} x {item.quantity}
                  </span>
                  <ProductPrice
                    price={item.product.price}
                    compareAtPrice={item.product.originalPrice}
                    quantity={item.quantity}
                    className="justify-end gap-2"
                    priceClassName="text-sm text-[#1A1A1A]"
                    compareClassName="text-xs text-[#888880] line-through"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#888880]">Subtotal</span>
                <ProductPrice
                  price={subtotal}
                  compareAtPrice={compareAtSubtotal}
                  className="justify-end gap-2"
                  priceClassName="text-sm text-[#1A1A1A]"
                  compareClassName="text-xs text-[#888880] line-through"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#888880]">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
            </div>

            <div className="border-t border-[#E8E4E0] pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-display text-2xl">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={proceedToPayment}
              disabled={!selectedAddress}
              className={`w-full text-[11px] font-medium tracking-[0.17em] uppercase py-4 flex items-center justify-center gap-2 transition-colors ${
                selectedAddress
                  ? 'bg-[#1A1A1A] text-white hover:bg-black'
                  : 'bg-[#E8E4E0] text-[#888880] cursor-not-allowed'
              }`}
            >
              Proceed to Payment
              <ArrowRight size={14} />
            </button>

            {!selectedAddress && (
              <p className="text-xs text-[#C0132A] text-center mt-3">
                Please select or add a delivery address
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
