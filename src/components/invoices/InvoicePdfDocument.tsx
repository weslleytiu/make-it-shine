import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import type { Invoice } from "@/lib/schemas";
import {
  INVOICE_COMPANY,
  INVOICE_PAYMENT_DETAILS,
  INVOICE_DEFAULT_TERMS,
  INVOICE_PDF_COLORS as C,
} from "@/lib/invoice-pdf-config";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: C.white,
  },
  // —— Top section: left = invoice title + meta; right = company branding ——
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  topLeft: {
    flexDirection: "column",
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: C.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  invoiceNumber: {
    fontSize: 10,
    color: C.text,
  },
  balanceDueLabel: {
    fontSize: 10,
    color: C.text,
    marginTop: 6,
  },
  balanceDueAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.text,
  },
  topRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
  },
  logoMs: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: C.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  logoImage: {
    width: 56,
    height: 56,
    objectFit: "contain",
    marginBottom: 4,
  },
  logoMsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.white,
  },
  brandMakeItShine: {
    fontSize: 12,
    color: C.secondary,
    fontWeight: "bold",
  },
  brandCleaningServices: {
    fontSize: 10,
    color: C.muted,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 10,
    fontWeight: "bold",
    color: C.text,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: C.text,
    textAlign: "right",
  },
  // —— Middle: Invoice details + Bill To (designer-aligned) ——
  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 24,
  },
  middleCard: {
    flex: 1,
    backgroundColor: C.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  middleCardTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: C.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  dateLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 10,
    color: C.muted,
  },
  dateValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: C.text,
  },
  billToName: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.text,
    marginBottom: 4,
  },
  billToAddress: {
    fontSize: 10,
    color: C.muted,
    lineHeight: 1.4,
  },
  // —— Table ——
  table: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.primary,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: "bold",
    color: C.white,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  col1: { width: "8%" },
  col2: { width: "42%" },
  col3: { width: "15%", textAlign: "right" as const },
  col4: { width: "15%", textAlign: "right" as const },
  col5: { width: "20%", textAlign: "right" as const },
  tableCellText: {
    fontSize: 10,
    color: C.text,
  },
  // —— Totals (right-aligned below table) ——
  totals: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
    marginBottom: 20,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 24,
    width: 220,
  },
  totalLabel: {
    fontSize: 10,
    color: C.text,
    width: 90,
    textAlign: "right",
  },
  totalValue: {
    fontSize: 10,
    color: C.text,
    width: 80,
    textAlign: "right",
  },
  totalValueBold: {
    fontWeight: "bold",
  },
  balanceDueRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 24,
    width: 220,
    backgroundColor: C.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  // —— Payment (designer-aligned) ——
  paymentBlock: {
    borderTopWidth: 2,
    borderTopColor: C.primary,
    paddingTop: 16,
    marginTop: 4,
  },
  paymentSectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: C.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  paymentSubtitle: {
    fontSize: 9,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  paymentCard: {
    backgroundColor: C.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  paymentCardTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: C.primary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paymentRow: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 10,
    color: C.muted,
    width: 110,
  },
  paymentValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: C.text,
    flex: 1,
  },
});

const serviceKindLabel = (kind: string) =>
  kind === "deep_clean" ? "Deep clean" : "Regular";

/** Line item passed to the PDF: service, duration, hourly rate for that service, and amount. */
export interface InvoicePdfJobLine {
  serviceKind: string;
  date: Date;
  startTime: string;
  durationHours: number;
  ratePerHour: number;
  totalPrice: number;
}

export interface InvoicePdfDocumentProps {
  invoice: Invoice;
  clientName: string;
  clientAddress?: string;
  jobs: InvoicePdfJobLine[];
  /** Logo as data URL (base64) or URL for reliable rendering in PDF. */
  logoSrc?: string;
}

export function InvoicePdfDocument({
  invoice,
  clientName,
  clientAddress,
  jobs,
  logoSrc,
}: InvoicePdfDocumentProps) {
  const issueDateStr = format(invoice.issueDate, "dd/MM/yyyy");
  const dueDateStr = format(invoice.dueDate, "dd/MM/yyyy");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Top: left = INVOICE + number + Balance Due; right = logo + brand + company */}
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>Invoice# {invoice.invoiceNumber}</Text>
            <Text style={styles.balanceDueLabel}>Balance Due</Text>
            <Text style={styles.balanceDueAmount}>£{invoice.total.toFixed(2)}</Text>
          </View>
          <View style={styles.topRight}>
            {logoSrc ? (
              <Image src={logoSrc} style={styles.logoImage} />
            ) : (
              <View style={styles.logoMs}>
                <Text style={styles.logoMsText}>MS</Text>
              </View>
            )}
            <Text style={styles.brandMakeItShine}>MAKE IT SHINE</Text>
            <Text style={styles.brandCleaningServices}>CLEANING SERVICES</Text>
            <Text style={styles.companyName}>{INVOICE_COMPANY.name}</Text>
            <Text style={styles.companyDetails}>{INVOICE_COMPANY.city}</Text>
            <Text style={styles.companyDetails}>{INVOICE_COMPANY.country}</Text>
            <Text style={styles.companyDetails}>{INVOICE_COMPANY.email}</Text>
          </View>
        </View>

        {/* Middle: Invoice details + Bill To (designer styling) */}
        <View style={styles.middleRow}>
          <View style={styles.middleCard}>
            <Text style={styles.middleCardTitle}>Invoice details</Text>
            <View style={styles.dateLine}>
              <Text style={styles.dateLabel}>Invoice date</Text>
              <Text style={styles.dateValue}>{issueDateStr}</Text>
            </View>
            <View style={styles.dateLine}>
              <Text style={styles.dateLabel}>Terms</Text>
              <Text style={styles.dateValue}>{INVOICE_DEFAULT_TERMS}</Text>
            </View>
            <View style={styles.dateLine}>
              <Text style={styles.dateLabel}>Due date</Text>
              <Text style={styles.dateValue}>{dueDateStr}</Text>
            </View>
          </View>
          <View style={styles.middleCard}>
            <Text style={styles.middleCardTitle}>Bill to</Text>
            <Text style={styles.billToName}>{clientName}</Text>
            {clientAddress ? (
              <Text style={styles.billToAddress}>{clientAddress}</Text>
            ) : null}
          </View>
        </View>

        {/* Service details table: service, duration, hourly rate (according to service), amount */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.tableHeaderText]}>#</Text>
            <Text style={[styles.col2, styles.tableHeaderText]}>Service & Date</Text>
            <Text style={[styles.col3, styles.tableHeaderText]}>Duration (h)</Text>
            <Text style={[styles.col4, styles.tableHeaderText]}>Rate (£/h)</Text>
            <Text style={[styles.col5, styles.tableHeaderText]}>Amount</Text>
          </View>
          {jobs.map((job, index) => {
            const description = `${serviceKindLabel(job.serviceKind)} – ${format(job.date, "dd/MM/yyyy")} ${job.startTime}`;
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.col1, styles.tableCellText]}>{index + 1}</Text>
                <Text style={[styles.col2, styles.tableCellText]}>{description}</Text>
                <Text style={[styles.col3, styles.tableCellText]}>{job.durationHours.toFixed(2)}</Text>
                <Text style={[styles.col4, styles.tableCellText]}>{job.ratePerHour.toFixed(2)}</Text>
                <Text style={[styles.col5, styles.tableCellText]}>{`£${job.totalPrice.toFixed(2)}`}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals + Balance Due row with light background */}
        <View style={styles.totals}>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Sub Total</Text>
            <Text style={styles.totalValue}>{invoice.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={[styles.totalLabel, styles.totalValueBold]}>Total</Text>
            <Text style={[styles.totalValue, styles.totalValueBold]}>£{invoice.total.toFixed(2)}</Text>
          </View>
          <View style={styles.balanceDueRow}>
            <Text style={[styles.totalLabel, styles.totalValueBold]}>Balance Due</Text>
            <Text style={[styles.totalValue, styles.totalValueBold]}>£{invoice.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Options / Bank details – designer styling */}
        <View style={styles.paymentBlock}>
          <Text style={styles.paymentSectionTitle}>Payment Options</Text>
          <Text style={styles.paymentSubtitle}>Terms & Conditions</Text>
          <View style={styles.paymentCard}>
            <Text style={styles.paymentCardTitle}>Bank transfer details</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Beneficiary</Text>
              <Text style={styles.paymentValue}>{INVOICE_PAYMENT_DETAILS.beneficiary}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Sort code</Text>
              <Text style={styles.paymentValue}>{INVOICE_PAYMENT_DETAILS.sortCode}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Account number</Text>
              <Text style={styles.paymentValue}>{INVOICE_PAYMENT_DETAILS.accountNumber}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Bank</Text>
              <Text style={styles.paymentValue}>{INVOICE_PAYMENT_DETAILS.bankAddress}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
