import { Html, Head, Body, Container, Section, Text, Img, Button, Hr, Tailwind } from '@react-email/components';
import * as React from 'react';

interface VoucherRedemptionEmailProps {
  customerName?: string;
  voucherCode?: string;
  voucherValueNaira?: string;
  coinsRedeemed?: string;
  remainingCoins?: string;
  validDays?: string;
  redemptionId?: string;
  redemptionDate?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://subforme.app'; // Replace with your actual app URL

export const VoucherRedemptionEmail = ({
  customerName = 'Valued Customer',
  voucherCode = 'VCH-XXXX-XXXX',
  voucherValueNaira = '0.00',
  coinsRedeemed = '0',
  remainingCoins = '0',
  validDays = '30',
  redemptionId = 'N/A',
  redemptionDate = 'N/A',
}: VoucherRedemptionEmailProps) => (
  <Html>
    <Head />
    <Tailwind>
      <Body className="bg-[#f6f3ec] font-sans text-[#1a1a1a]">
        <Container className="mx-auto p-8">
          {/* Preheader (hidden) */}
          <div className="hidden text-[1px] leading-[1px] max-h-0 max-w-0 opacity-0 overflow-hidden mso-hide:all">
            Your voucher code is ready — you've successfully redeemed your coins on Subforme.
          </div>

          <Section className="bg-[#fffdf8] border border-[#ece6d8] rounded-xl overflow-hidden max-w-[600px] mx-auto">
            {/* Brand bar */}
            <Section className="px-10 pt-7">
              <Text className="font-serif text-xl tracking-wider text-[#1a1a1a] font-semibold m-0">
                SUBFORME
              </Text>
              <Text className="text-xs text-[#7a7466] tracking-wider uppercase text-right m-0">
                Coin Redemption
              </Text>
            </Section>

            {/* Hero */}
            <Section className="px-10 pt-9 pb-2">
              <Text className="font-serif text-3xl leading-tight font-medium text-[#1a1a1a] m-0">
                Your code is ready, {customerName}.
              </Text>
              <Text className="text-base leading-6 text-[#5b554a] mt-3 mb-0">
                Success! You've successfully redeemed your coins for a voucher. Use the code below in the app to apply your discount or activate your service.
              </Text>
            </Section>

            {/* Code card */}
            <Section className="px-10 pt-7 pb-2">
              <Section className="bg-[#1a1a1a] rounded-lg">
                <Text className="text-xs tracking-widest uppercase text-[#b8b0a0] text-center pt-7 pb-2 m-0">
                  Your voucher code
                </Text>
                <Text className="font-mono text-3xl tracking-[10px] text-[#fffdf8] font-bold text-center pb-2 m-0">
                  {voucherCode}
                </Text>
                <Text className="text-xs text-[#8e887a] text-center pb-7 m-0">
                  Valid for {validDays} days · Single use
                </Text>
              </Section>
            </Section>

            {/* CTA */}
            <Section className="px-10 pt-6 pb-2 text-center">
              <Button
                href={`${baseUrl}/app/voucher`}
                className="inline-block px-7 py-3 text-sm font-semibold text-[#fffdf8] no-underline rounded-full bg-[#1a1a1a] tracking-wide"
              >
                Redeem in app →
              </Button>
              <Text className="text-xs text-[#7a7466] mt-3 mb-0">
                Or paste the code manually under <em>App → Voucher</em>.
              </Text>
            </Section>

            {/* Transaction summary */}
            <Section className="px-10 pt-8 pb-2">
              <Text className="text-xs tracking-widest uppercase text-[#7a7466] mb-2 m-0">
                Transaction summary
              </Text>
              <Hr className="border-t border-[#ece6d8] my-0" />
              <Section className="text-sm text-[#1a1a1a]">
                <Text className="py-3 border-b border-[#ece6d8] m-0 flex justify-between">
                  <span>Voucher Value</span>
                  <span className="text-right">{voucherValueNaira} NGN</span>
                </Text>
                <Text className="py-3 border-b border-[#ece6d8] text-[#5b554a] m-0 flex justify-between">
                  <span>Coins Redeemed</span>
                  <span className="text-right">{coinsRedeemed} Coins</span>
                </Text>
                <Text className="py-4 font-semibold m-0 flex justify-between">
                  <span>Remaining Balance</span>
                  <span className="text-right">{remainingCoins} Coins</span>
                </Text>
              </Section>
              <Text className="text-xs text-[#7a7466] mt-1 mb-0">
                Redemption #{redemptionId} · {redemptionDate}
              </Text>
            </Section>

            {/* Helper */}
            <Section className="px-10 pt-6 pb-2">
              <Section className="bg-[#f6f3ec] rounded-lg">
                <Text className="p-5 text-sm leading-5 text-[#5b554a] m-0">
                  <Text className="font-bold text-[#1a1a1a] inline">Need help?</Text> Reply to this email or visit our
                  <a href={`${baseUrl}/help`} className="text-[#1a1a1a] underline">
                    help center
                  </a>.
                  Vouchers purchased with coins are non-refundable and tied to your account.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="px-10 pt-7 pb-9 text-center">
              <Text className="font-serif text-base tracking-wider text-[#1a1a1a] m-0">
                SUBFORME
              </Text>
              <Text className="text-xs text-[#9a9485] mt-2 leading-normal m-0">
                You're receiving this because you redeemed coins for a voucher on Subforme.<br />
                © 2026 Subforme · <a href={`${baseUrl}/unsubscribe`} className="text-[#9a9485]">Unsubscribe</a>
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default VoucherRedemptionEmail;
