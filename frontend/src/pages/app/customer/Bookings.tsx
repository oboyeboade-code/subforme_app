import { useNavigate, useLocation } from "react-router-dom";
import { FormEvent, useEffect, useState } from "react";
import { serviceApi, type Service } from "@/lib/api/";

const Bookings = () => {
  const [services, setServices] = useState<Service[]>([]);
  useEffect(() => { serviceApi.listServices().then(res => setServices(res.data.services)); }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const serviceId = new URLSearchParams(location.search).get("serviceId");
  const selectedService = services.find((s) => s._id === serviceId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    navigate("/app/paid");
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <header className="pb-6 border-b-2 border-ink mb-8">
        <p className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-print-red mb-2">
          Step · 01 of 02
        </p>

        <h1 className="font-editorial text-4xl text-ink">
          Book this service
        </h1>
      </header>

      {selectedService && (
        <div className="mb-6 p-4 border-2 border-ink bg-card">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Booking for
          </p>

          <h2 className="font-editorial text-2xl text-ink">
            {selectedService.vendorBusinessId.businessName}
          </h2>

          <p className="text-sm text-print-red">
            {selectedService.tags}
          </p>
        </div>
      )}

      {!selectedService && (
        <div className="mb-6 p-4 border-2 border-print-red text-print-red text-sm">
          No offer selected. Please go back and choose an offer.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Full name">
          <input type="text" required className={inputCls} placeholder="Ada Aluwe" />
        </Field>

        <Field label="Email">
          <input type="email" required className={inputCls} placeholder="ada@mail.com" />
        </Field>

        <Field label="Select location">
          <select required className={inputCls} defaultValue="">
            <option value="" disabled>Choose a branch</option>
            <option>Ikeja Branch</option>
            <option>Yaba Branch</option>
            <option>Lekki Branch</option>
          </select>
        </Field>

        <Field label="Preferred date">
          <input type="date" required className={inputCls} />
        </Field>

        <button
          type="submit"
          className="w-full bg-print-red text-primary-foreground border-2 border-ink py-4 font-mono-display text-sm uppercase tracking-[0.2em] hover:bg-print-red/90 transition-colors"
        >
          Confirm booking →
        </button>
      </form>
    </div>
  );
};

const inputCls =
  "w-full border-2 border-ink bg-card px-3 py-2.5 font-mono-display text-sm text-ink outline-none focus:bg-paper";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-1.5">
      {label}
    </span>
    {children}
  </label>
);

export default Bookings;