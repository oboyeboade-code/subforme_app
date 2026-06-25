import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";

import Index from "@/pages/app/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/app/customer/Login";
import ForgotPassword from "@/pages/app/customer/ForgotPassword";
import ResetPassword from "@/pages/app/customer/ResetPassword";
import VendorLogin from "@/pages/app/vendor/VendorLogin";
import VendorForgotPassword from "@/pages/app/vendor/VendorForgotPassword";
import VendorResetPassword from "@/pages/app/vendor/VendorResetPassword";
import VendorServiceRequest from "@/pages/app/vendor/VendorServiceRequest";
import VendorDashboard from "@/pages/app/vendor/VendorDashboard";
import VendorHome from "@/pages/app/vendor/VendorHome";
import VendorEarnings from "@/pages/app/vendor/VendorEarnings";
import Register from "@/pages/app/customer/Register";
import AppLayout from "@/components/app/AppLayout";
import AppHome from "@/pages/app/customer/AppHome";
import Offers from "@/pages/app/customer/Offers";
import Dashboard from "@/pages/app/customer/Dashboard";
import Subs from "@/pages/app/customer/Subs";
import Readmore from "@/pages/app/customer/Readmore";
import Bookings from "@/pages/app/customer/Bookings";
import Paid from "@/pages/app/customer/Paid";
import Verify from "@/pages/app/customer/Verify";
import Voucher from "@/pages/app/customer/Voucher";
import { UIVersionProvider } from "@/components/uiversion/UIVersionContext";

import V3AppLayout from "@/components/v3/V3AppLayout";
import V3Index from "@/pages/v3/V3Index";
import V3Login from "@/pages/v3/customer/V3Login";
import V3Register from "@/pages/v3/customer/V3Register";
import V3VendorLogin from "@/pages/v3/vendor/V3VendorLogin";
import V3ForgotPassword from "@/pages/v3/customer/V3ForgotPassword";
import V3ResetPassword from "@/pages/v3/customer/V3ResetPassword";
import V3VendorForgotPassword from "@/pages/v3/vendor/V3VendorForgotPassword";
import V3VendorResetPassword from "@/pages/v3/vendor/V3VendorResetPassword";
import V3VendorServiceRequest from "@/pages/v3/vendor/V3VendorServiceRequest";
import V3VendorDashboard from "@/pages/v3/vendor/V3VendorDashboard";
import V3VendorEarnings from "@/pages/v3/vendor/V3VendorEarnings";
import V3AppHome from "@/pages/v3/customer/V3AppHome";
import V3Offers from "@/pages/v3/customer/V3Offers";
import V3Dashboard from "@/pages/v3/customer/V3Dashboard";
import V3Subs from "@/pages/v3/customer/V3Subs";
import V3Readmore from "@/pages/v3/customer/V3Readmore";
import V3Bookings from "@/pages/v3/customer/V3Bookings";
import V3Paid from "@/pages/v3/customer/V3Paid";
import V3Verify from "@/pages/v3/customer/V3Verify";
import V3Voucher from "@/pages/v3/customer/V3Voucher";
import V3VendorHome from "@/pages/v3/vendor/V3VendorHome";

import VendorLayout from "@/components/app/VendorLayout";
import V3VendorLayout from "@/components/v3/V3VendorLayout";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminForgotPassword from "@/pages/admin/AdminForgotPassword";
import AdminResetPassword from "@/pages/admin/AdminResetPassword";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProviders from "@/pages/admin/AdminProviders";
import AdminServices from "@/pages/admin/AdminServices";
import AdminCodes from "@/pages/admin/AdminCodes";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminHome from "@/pages/admin/AdminHome";

import AdminContactMessages from "@/pages/admin/AdminContactMessages";
import AdminVendorRequests from "@/pages/admin/AdminVendorRequests";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
          <BrowserRouter>
            <UIVersionProvider>
              <Routes>
                {/* Root: Show Editorial by default, users see banner to switch */}
                {/* Editorial Customer / Vendor Auth Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/vendor-login" element={<VendorLogin />} />
                <Route path="/vendor/forgot-password" element={<VendorForgotPassword />} />
                <Route path="/vendor/reset-password" element={<VendorResetPassword />} />
                <Route path="/vendor/request-listing" element={<VendorServiceRequest />} />

                {/* V3 Customer / Vendor Auth Routes */}
                <Route path="/v3" element={<V3Index />} />
                <Route path="/v3/login" element={<V3Login />} />
                <Route path="/v3/forgot-password" element={<V3ForgotPassword />} />
                <Route path="/v3/reset-password" element={<V3ResetPassword />} />
                <Route path="/v3/register" element={<V3Register />} />
                <Route path="/v3/vendor-login" element={<V3VendorLogin />} />
                <Route path="/v3/vendor/forgot-password" element={<V3VendorForgotPassword />} />
                <Route path="/v3/vendor/reset-password" element={<V3VendorResetPassword />} />
                <Route path="/v3/vendor/request-listing" element={<V3VendorServiceRequest />} />

                {/* Editorial Customer Routess - Nested Layout */}
                <Route path="/register" element={<Register />} />
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<AppHome />} />
                  <Route path="offers" element={<Offers />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="subs" element={<Subs />} />
                  <Route path="readmore/:id" element={<Readmore />} />
                  <Route path="bookings" element={<Bookings />} />
                  <Route path="paid" element={<Paid />} />
                  <Route path="verify" element={<Verify />} />
                  <Route path="voucher" element={<Voucher />} />
                </Route>

                {/* V3 Customer Routes - Nested Layout */}
                <Route path="/v3/app" element={<V3AppLayout />}>
                  <Route index element={<V3AppHome />} />
                  <Route path="offers" element={<V3Offers />} />
                  <Route path="dashboard" element={<V3Dashboard />} />
                  <Route path="subs" element={<V3Subs />} />
                  <Route path="readmore/:id" element={<V3Readmore />} />
                  <Route path="bookings" element={<V3Bookings />} />
                  <Route path="paid" element={<V3Paid />} />
                  <Route path="verify" element={<V3Verify />} />
                  <Route path="voucher" element={<V3Voucher />} />
                </Route>

                {/* Editorial Vendor Routes - Nested Layout */}
                <Route path="/vendor" element={<VendorLayout />}>
                  <Route index element={<VendorHome />} />
                  <Route path="dashboard" element={<VendorDashboard />} />
                  <Route path="earnings" element={<VendorEarnings />} />
                </Route>

                {/* V3 Vendor Routes - Nested Layout */}
                <Route path="/v3/vendor" element={<V3VendorLayout />}>
                  <Route index element={<V3VendorHome />} />
                  <Route path="dashboard" element={<V3VendorDashboard />} />
                  <Route path="earnings" element={<V3VendorEarnings />} />
                </Route>

                {/* ADMIN */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
                <Route path="/admin/reset-password" element={<AdminResetPassword />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminHome />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="providers" element={<AdminProviders />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="codes" element={<AdminCodes />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="messages" element={<AdminContactMessages />} />
                  <Route path="vendor-requests" element={<AdminVendorRequests />} />
                </Route>

                {/* Not Found Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </UIVersionProvider>
          </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
}
