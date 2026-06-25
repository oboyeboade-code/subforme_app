import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

/**
 * One BundleCard per service in the order.
 *  - /booking → one card (single service)
 *  - /checkout → one card per service, each with its N codes
 */
export interface BundleCard {
  /** Short human reference, e.g. "SF-00427" */
  reference: string;
  /** Vendor / business name, e.g. "Foody Café" */
  vendor: string;
  /** Service name purchased, e.g. "Lunch" */
  serviceName: string;
  /** Quantity bought of this service */
  quantity: number;
  /** Per-code state. Length should equal quantity. Codes are 8 chars. */
  codes: Array<{ code: string; used?: boolean }>;
  /** Optional status label, defaults to "Bundle active" */
  statusLabel?: string;
}

export interface BookingCodesEmailProps {
  /** Recipient's first name; falls back to "there" */
  recipientName?: string;
  /** One card per service in this order */
  bundles: BundleCard[];
}

export const BookingCodesEmail = ({
  recipientName,
  bundles,
}: BookingCodesEmailProps) => {
  const single = bundles.length === 1;
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        {single
          ? `Your ${bundles[0].quantity} × ${bundles[0].serviceName} codes for ${bundles[0].vendor}`
          : `Your codes for ${bundles.length} services`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>
            {recipientName ? `Hi ${recipientName},` : "Hi there,"}
          </Heading>
          <Text style={lede}>
            {single
              ? "Your bundle is ready. Show a code at the counter to redeem."
              : "Your bundles are ready. Show a code at the counter to redeem."}
          </Text>

          {bundles.map((b, i) => (
            <BundleCardBlock key={`${b.reference}-${i}`} {...b} />
          ))}

          <Text style={footnote}>
            Each code is single-use. Keep this email safe — you can also reveal
            codes any time from your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

BookingCodesEmail.PreviewProps = {
  recipientName: "Ada",
  bundles: [
    {
      reference: "SF-00427",
      vendor: "Foody Café",
      serviceName: "Lunch",
      quantity: 4,
      codes: [
        { code: "FD-7K2A99", used: true },
        { code: "FD-9M1QXP" },
        { code: "FD-3P8RTV" },
        { code: "FD-Z4VC2K" },
      ],
    },
  ],
} satisfies BookingCodesEmailProps;

export default BookingCodesEmail;

/* ---------------- Card ---------------- */

function BundleCardBlock({
  reference,
  vendor,
  serviceName,
  quantity,
  codes,
  statusLabel = "Bundle active",
}: BundleCard) {
  return (
    <Section style={card}>
      {/* Top row: status + reference */}
      <table width="100%" cellPadding={0} cellSpacing={0} style={rowReset}>
        <tbody>
          <tr>
            <td style={{ ...cellLeft, color: muted }}>
              <span style={dot} />
              {statusLabel}
            </td>
            <td style={{ ...cellRight, color: muted, fontVariantNumeric: "tabular-nums" }}>
              {reference}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Vendor / Bundle */}
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ ...rowReset, marginTop: 18 }}>
        <tbody>
          <tr>
            <td style={{ ...cellLeft, color: muted, fontSize: 13 }}>Vendor</td>
            <td style={{ ...cellRight, color: muted, fontSize: 13 }}>Bundle</td>
          </tr>
          <tr>
            <td style={{ ...cellLeft, ...bigValue }}>{vendor}</td>
            <td style={{ ...cellRight, ...bigValue }}>
              {quantity} × {serviceName}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={divider} />

      <Text style={sectionLabel}>Your codes</Text>

      {/* 2-col code grid */}
      <table width="100%" cellPadding={0} cellSpacing={0} style={rowReset}>
        <tbody>
          {chunk(codes, 2).map((pair, rIdx) => (
            <tr key={rIdx}>
              {[0, 1].map((cIdx) => {
                const item = pair[cIdx];
                return (
                  <td
                    key={cIdx}
                    width="50%"
                    style={{
                      padding: rIdx === 0 ? "0 6px 12px" : "12px 6px",
                      paddingLeft: cIdx === 0 ? 0 : 6,
                      paddingRight: cIdx === 1 ? 0 : 6,
                      verticalAlign: "top",
                    }}
                  >
                    {item ? <CodeChip {...item} /> : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

function CodeChip({ code, used }: { code: string; used?: boolean }) {
  return (
    <table
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{
        ...rowReset,
        background: used ? "#efece4" : "#ffffff",
        border: `1px solid ${used ? "#e3dfd3" : "#e8e4d8"}`,
        borderRadius: 10,
      }}
    >
      <tbody>
        <tr>
          <td
            style={{
              padding: "14px 16px",
              fontFamily: monoFont,
              fontSize: 15,
              letterSpacing: 0.4,
              color: used ? "#a39e90" : ink,
              textDecoration: used ? "line-through" : "none",
            }}
          >
            {code}
          </td>
          <td
            align="right"
            style={{
              padding: "14px 16px",
              fontFamily: monoFont,
              fontSize: 12,
              color: used ? "#a39e90" : "#6b6657",
            }}
          >
            {used ? (
              <span style={{ textDecoration: "line-through" }}>USED</span>
            ) : (
              "✓"
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/* ---------------- helpers ---------------- */

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/* ---------------- styles ---------------- */

const ink = "#1a1a1a";
const muted = "#8a8674";
const paper = "#f5f1e8";
const monoFont =
  '"SF Mono", ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace';
const serifFont =
  '"Söhne", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';

const body: React.CSSProperties = {
  margin: 0,
  padding: "32px 16px",
  backgroundColor: "#ffffff",
  fontFamily: serifFont,
  color: ink,
};

const container: React.CSSProperties = {
  maxWidth: 600,
  margin: "0 auto",
};

const h1: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  margin: "0 0 6px",
  color: ink,
};

const lede: React.CSSProperties = {
  fontSize: 14,
  lineHeight: "22px",
  color: "#5b5a51",
  margin: "0 0 24px",
};

const card: React.CSSProperties = {
  background: paper,
  borderRadius: 18,
  padding: "28px 30px 24px",
  marginBottom: 18,
};

const rowReset: React.CSSProperties = {
  borderCollapse: "collapse",
  width: "100%",
};

const cellLeft: React.CSSProperties = {
  textAlign: "left",
  fontSize: 14,
  verticalAlign: "middle",
};

const cellRight: React.CSSProperties = {
  textAlign: "right",
  fontSize: 14,
  verticalAlign: "middle",
};

const dot: React.CSSProperties = {
  display: "inline-block",
  width: 8,
  height: 8,
  borderRadius: 999,
  background: "#2f5e3a",
  marginRight: 10,
  verticalAlign: "middle",
};

const bigValue: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 600,
  paddingTop: 4,
  color: ink,
  letterSpacing: -0.2,
};

const divider: React.CSSProperties = {
  height: 1,
  background: "#e3dfd3",
  margin: "22px 0 18px",
};

const sectionLabel: React.CSSProperties = {
  fontSize: 13,
  color: muted,
  margin: "0 0 14px",
};

const footnote: React.CSSProperties = {
  fontSize: 12,
  color: "#8a8674",
  lineHeight: "18px",
  margin: "20px 4px 0",
  textAlign: "center",
};