import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  subject: z.string().trim().min(2, "Subject is too short").max(120),
  message: z.string().trim().min(10, "Tell us a bit more").max(2000),
});

const SUPPORT_EMAIL = "support@subforme.com";

export default function V3ContactSection() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = contactSchema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      subject: fd.get("subject"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitting(true);
    const { name, email, subject, message } = parsed.data;
    const body = `From: ${name} <${email}>%0D%0A%0D%0A${encodeURIComponent(message)}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      `[Subforme] ${subject}`,
    )}&body=${body}`;
    toast.success("Drafting your message…");
    setSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section id="contact" className="py-20 md:py-28" aria-labelledby="v3-contact-heading">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-5"
          >
            <p className="text-sm font-medium text-print-red">Contact</p>
            <h2
              id="v3-contact-heading"
              className="font-v3-display mt-3 text-4xl md:text-5xl tracking-tight"
            >
              Questions or feedback? <span className="v3-grad-text">We'd love to hear from you.</span>
            </h2>
            <p className="mt-4 text-ink/65 leading-relaxed max-w-md">
              Support, partnerships, or press inquiries — drop a note and the right
              desk replies within one business day.
            </p>

            <div className="mt-8 space-y-3">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="v3-card flex items-center gap-3 px-4 py-3 hover:-translate-y-0.5 transition-transform"
              >
                <Mail className="h-4 w-4 text-print-red" />
                <span className="text-sm">{SUPPORT_EMAIL}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-ink/40" />
              </a>
              <div className="flex items-center gap-3 px-4 py-3 text-sm text-ink/60">
                <Clock className="h-4 w-4" />
                Mon-Fri · 09:00-18:00 WAT
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-sm text-ink/60">
                <MessageSquare className="h-4 w-4" />
                Avg. response · under 24 hrs
              </div>
            </div>
          </motion.div>

          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-7 v3-card p-6 md:p-8"
            noValidate
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Name" name="name" placeholder="Ada Lovelace" maxLength={80} />
              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="you@domain.com"
                maxLength={160}
              />
            </div>
            <div className="mt-4">
              <Field
                label="Subject"
                name="subject"
                placeholder="Support, partnership, press…"
                maxLength={120}
              />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-ink/70">Message</label>
              <textarea
                name="message"
                rows={5}
                maxLength={2000}
                placeholder="Tell us what's on your mind."
                className="w-full resize-y rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-print-red/50 transition-colors"
              />
            </div>
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="text-xs text-ink/50">
                By submitting you agree to be contacted at the email provided.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="v3-btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send message"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink/70">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-print-red/50 transition-colors"
      />
    </div>
  );
}
