import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { V3Card, V3Input, V3Button, V3Pill } from "@/components/v3/V3UI";
import { serviceApi, type Service } from "@/lib/api/";

const V3Bookings = () => {
  const [services, setServices] = useState<Service[]>([]);
  useEffect(() => { serviceApi.listServices().then(res => setServices(res.data.services)); }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const ServiceId = new URLSearchParams(location.search).get("ServiceId");

  const selectedService = services.find((o) => o._id === ServiceId);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/v3/app/paid");
  };

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <V3Card className="p-7 md:p-10">
          <V3Pill tone="red" className="mb-4">
            Step 01 of 02
          </V3Pill>

          <h1 className="font-v3-display text-3xl md:text-4xl tracking-tight mb-6">
            Book this service
          </h1>

          {selectedService && (
            <div className="mb-6 p-4 rounded-xl bg-ink/[0.04] border border-ink/15">
              <p className="text-xs uppercase tracking-wider text-ink/60">
                Booking for
              </p>

              <h2 className="font-v3-display text-xl">
                {selectedService.name} - {selectedService.vendorBusinessId.businessName}
              </h2>

              <p className="text-sm text-ink/60 mt-1">
                {selectedService.tags}
              </p>
            </div>
          )}

          {!selectedService && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              No Service selected. Please go back and choose an Service.
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <V3Input
              name="name"
              label="Full name"
              placeholder="Ada Aluwe"
              required
            />

            <V3Input
              name="email"
              type="email"
              label="Email"
              placeholder="ada@mail.com"
              required
            />

            <label className="block">
              <span className="block text-xs font-medium text-ink/70 mb-1.5">
                Select location
              </span>

              <select
                required
                defaultValue=""
                className="w-full rounded-xl border border-ink/12 bg-paper px-4 py-3 text-[15px] text-ink focus:outline-none focus:border-print-red/40 focus:ring-4 focus:ring-print-red/10 transition-all"
              >
                <option value="" disabled>
                  Choose a branch
                </option>
                <option>Ikeja Branch</option>
                <option>Yaba Branch</option>
                <option>Lekki Branch</option>
              </select>
            </label>

            <V3Input name="date" type="date" label="Preferred date" required />

            <V3Button type="submit" size="lg" fullWidth>
              Confirm booking <ArrowRight className="h-4 w-4" />
            </V3Button>
          </form>
        </V3Card>
      </motion.div>
    </div>
  );
};

export default V3Bookings;