"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/app/lib/axios";
import Navbar from "@/app/components/Navbar";
import { useAuthStore } from "@/app/store/useAuthStore";
import toast from "react-hot-toast";
import { FiMapPin, FiEdit, FiTrash2, FiStar, FiPlus } from "react-icons/fi";
import PageTransition, {
  StaggerContainer,
  StaggerItem,
  FadeIn,
} from "@/app/components/PageTransition";

interface Address {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

interface FormErrors {
  label?: string;
  recipient_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
}

export default function AddressesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    recipient_name: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    is_default: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      router.push("/login");
      return;
    }
    fetchAddresses();
  }, [user, mounted]);

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get("/addresses");
      setAddresses(data);
    } catch (error) {
      toast.error("Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.label.trim()) {
      newErrors.label = "Label is required";
    }

    if (!formData.recipient_name.trim()) {
      newErrors.recipient_name = "Recipient name is required";
    } else if (formData.recipient_name.trim().length < 2) {
      newErrors.recipient_name = "Name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s+-]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.province.trim()) {
      newErrors.province = "Province is required";
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = "Postal code is required";
    } else if (!/^\d{5}$/.test(formData.postal_code)) {
      newErrors.postal_code = "Postal code must be 5 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (editingAddress) {
        await axios.patch(`/addresses/${editingAddress.id}`, formData);
        toast.success("Address updated!");
      } else {
        await axios.post("/addresses", formData);
        toast.success("Address added!");
      }
      setShowModal(false);
      resetForm();
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await axios.delete(`/addresses/${id}`);
      toast.success("Address deleted");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      await axios.patch(`/addresses/${id}/set-default`);
      toast.success("Default address updated");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to set default address");
    }
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      recipient_name: address.recipient_name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      province: address.province,
      postal_code: address.postal_code,
      is_default: address.is_default,
    });
    setErrors({});
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingAddress(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      label: "",
      recipient_name: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postal_code: "",
      is_default: false,
    });
    setErrors({});
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const getInputClass = (errorKey?: string) => {
    return `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
      errorKey
        ? "border-red-500 focus:ring-red-400"
        : "border-neutral-300 focus:ring-lime-500"
    }`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <svg
              className="animate-spin h-6 w-6 text-lime-600"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-neutral-600">Loading addresses...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen bg-neutral-50">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <FadeIn>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-800">
                    My Addresses
                  </h1>
                  <p className="text-neutral-500 mt-1">
                    Manage your delivery addresses
                  </p>
                </div>
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 bg-lime-600 text-white px-5 py-2.5 rounded-lg hover:bg-lime-700 transition"
                >
                  <FiPlus size={18} />
                  Add Address
                </button>
              </div>
            </FadeIn>

            {addresses.length === 0 ? (
              <FadeIn delay={0.1}>
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMapPin className="text-neutral-400 text-3xl" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-neutral-700">
                    No addresses yet
                  </h2>
                  <p className="text-neutral-500 mb-6">
                    Add your first delivery address
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 bg-lime-600 text-white px-6 py-2.5 rounded-lg hover:bg-lime-700 transition"
                  >
                    <FiPlus size={18} />
                    Add Address
                  </button>
                </div>
              </FadeIn>
            ) : (
              <StaggerContainer>
                <div className="grid md:grid-cols-2 gap-5">
                  {addresses.map((address) => (
                    <StaggerItem key={address.id}>
                      <div
                        className={`bg-white rounded-2xl shadow-sm border-2 p-6 transition ${
                          address.is_default
                            ? "border-lime-500 ring-2 ring-lime-100"
                            : "border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-neutral-800">
                              {address.label}
                            </h3>
                            {address.is_default && (
                              <span className="inline-flex items-center gap-1 bg-lime-100 text-lime-700 text-xs px-2 py-1 rounded-full mt-1">
                                <FiStar size={12} />
                                Default
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <p className="font-medium text-neutral-800">
                            {address.recipient_name}
                          </p>
                          <p className="text-neutral-600">{address.phone}</p>
                          <p className="text-neutral-700">{address.address}</p>
                          <p className="text-neutral-500">
                            {address.city}, {address.province}{" "}
                            {address.postal_code}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-neutral-100 flex gap-2">
                          {!address.is_default && (
                            <button
                              onClick={() => setDefaultAddress(address.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-100 text-neutral-700 py-2 rounded-lg hover:bg-neutral-200 text-sm font-medium transition"
                            >
                              <FiStar size={14} />
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(address)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 text-sm font-medium transition"
                          >
                            <FiEdit size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(address.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 text-sm font-medium transition"
                          >
                            <FiTrash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            )}
          </div>
        </div>
      </PageTransition>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-800">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Label (e.g., Home, Office)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => handleChange("label", e.target.value)}
                  className={`${getInputClass(errors.label)} text-neutral-700`}
                  placeholder="Home"
                />
                {errors.label && (
                  <p className="text-red-500 text-xs mt-1">{errors.label}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={formData.recipient_name}
                    onChange={(e) =>
                      handleChange("recipient_name", e.target.value)
                    }
                    className={`${getInputClass(errors.recipient_name)} text-neutral-700`}
                    placeholder="John Doe"
                  />
                  {errors.recipient_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.recipient_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`${getInputClass(errors.phone)} text-neutral-700`}
                    placeholder="08123456789"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Full Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className={`${getInputClass(errors.address)} text-neutral-700`}
                  rows={3}
                  placeholder="Street address, building, apartment, etc."
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className={`${getInputClass(errors.city)} text-neutral-700`}
                    placeholder="Jakarta"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Province
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => handleChange("province", e.target.value)}
                    className={`${getInputClass(errors.province)} text-neutral-700`}
                    placeholder="DKI Jakarta"
                  />
                  {errors.province && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.province}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) =>
                      handleChange("postal_code", e.target.value)
                    }
                    className={`${getInputClass(errors.postal_code)} text-neutral-700`}
                    placeholder="12345"
                    maxLength={5}
                  />
                  {errors.postal_code && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.postal_code}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) =>
                    setFormData({ ...formData, is_default: e.target.checked })
                  }
                  className="w-4 h-4 text-lime-600 rounded focus:ring-lime-500"
                />
                <label
                  htmlFor="is_default"
                  className="text-sm text-neutral-700"
                >
                  Set as default address
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-neutral-200 text-neutral-700 py-2.5 rounded-lg hover:bg-neutral-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-lime-600 text-white py-2.5 rounded-lg hover:bg-lime-700 font-medium transition"
                >
                  {editingAddress ? "Update" : "Add"} Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
