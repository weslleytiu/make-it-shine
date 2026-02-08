import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import type { Invoice } from "@/lib/schemas";
import type { Job } from "@/lib/schemas";
import {
  INVOICE_COMPANY,
  INVOICE_PAYMENT_DETAILS,
  INVOICE_DEFAULT_TERMS,
  INVOICE_DEFAULT_NOTES,
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
  // —— Middle: dates (left) and Bill To (right) ——
  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  datesBlock: {
    flexDirection: "column",
    gap: 6,
    width: "45%",
  },
  dateLine: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateLabel: {
    fontSize: 10,
    color: C.text,
  },
  dateValue: {
    fontSize: 10,
    color: C.text,
  },
  billToBlock: {
    width: "50%",
    flexDirection: "column",
    gap: 4,
  },
  billToLabel: {
    fontSize: 10,
    color: C.text,
  },
  billToName: {
    fontSize: 10,
    fontWeight: "bold",
    color: C.text,
  },
  billToAddress: {
    fontSize: 10,
    color: C.text,
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
  // —— Notes ——
  notesBlock: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 10,
    color: C.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 10,
    color: C.text,
    lineHeight: 1.4,
  },
  // —— Payment ——
  paymentBlock: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 14,
  },
  paymentOptionsLabel: {
    fontSize: 10,
    color: C.text,
    marginBottom: 6,
  },
  termsLabel: {
    fontSize: 10,
    color: C.text,
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: "row",
    marginBottom: 4,
    gap: 8,
  },
  paymentLabel: {
    fontSize: 10,
    color: C.text,
    width: 100,
  },
  paymentValue: {
    fontSize: 10,
    color: C.text,
  },
});

export interface InvoicePdfDocumentProps {
  invoice: Invoice;
  clientName: string;
  clientAddress?: string;
  jobs: Array<Pick<Job, "durationHours" | "totalPrice">>;
}

export function InvoicePdfDocument({
  invoice,
  clientName,
  clientAddress,
  jobs,
}: InvoicePdfDocumentProps) {
  const totalHours = jobs.reduce((sum, j) => sum + (j.durationHours ?? 0), 0);
  const rate = totalHours > 0 ? invoice.subtotal / totalHours : 0;

  const issueDateStr = format(invoice.issueDate, "dd/MM/yyyy");
  const dueDateStr = format(invoice.dueDate, "dd/MM/yyyy");
  const notes = invoice.notes || INVOICE_DEFAULT_NOTES;

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
            <View style={styles.logoMs}>
              <Text style={styles.logoMsText}>MS</Text>
            </View>
            <Text style={styles.brandMakeItShine}>MAKE IT SHINE</Text>
            <Text style={styles.brandCleaningServices}>CLEANING SERVICES</Text>
            <Text style={styles.companyName}>{INVOICE_COMPANY.name}</Text>
            <Text style={styles.companyDetails}>{INVOICE_COMPANY.city}</Text>
            <Text style={styles.companyDetails}>{INVOICE_COMPANY.country}</Text>
            <Text style={styles.companyDetails}>{INVOICE_COMPANY.email}</Text>
          </View>
        </View>

        {/* Middle: dates left, Bill To right */}
        <View style={styles.middleRow}>
          <View style={styles.datesBlock}>
            <View style={styles.dateLine}>
              <Text style={styles.dateLabel}>Invoice Date :</Text>
              <Text style={styles.dateValue}>{issueDateStr}</Text>
            </View>
            <View style={styles.dateLine}>
              <Text style={styles.dateLabel}>Terms :</Text>
              <Text style={styles.dateValue}>{INVOICE_DEFAULT_TERMS}</Text>
            </View>
            <View style={styles.dateLine}>
              <Text style={styles.dateLabel}>Due Date :</Text>
              <Text style={styles.dateValue}>{dueDateStr}</Text>
            </View>
          </View>
          <View style={styles.billToBlock}>
            <Text style={styles.billToLabel}>Bill To</Text>
            <Text style={styles.billToName}>{clientName}</Text>
            {clientAddress ? (
              <Text style={styles.billToAddress}>{clientAddress}</Text>
            ) : null}
          </View>
        </View>

        {/* Service details table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.tableHeaderText]}>#</Text>
            <Text style={[styles.col2, styles.tableHeaderText]}>Item & Description</Text>
            <Text style={[styles.col3, styles.tableHeaderText]}>Qty</Text>
            <Text style={[styles.col4, styles.tableHeaderText]}>Rate</Text>
            <Text style={[styles.col5, styles.tableHeaderText]}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.col1, styles.tableCellText]}>1</Text>
            <Text style={[styles.col2, styles.tableCellText]}>Cleaning services</Text>
            <Text style={[styles.col3, styles.tableCellText]}>{totalHours.toFixed(2)}</Text>
            <Text style={[styles.col4, styles.tableCellText]}>{rate.toFixed(2)}</Text>
            <Text style={[styles.col5, styles.tableCellText]}>{invoice.subtotal.toFixed(2)}</Text>
          </View>
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

        {/* Notes */}
        <View style={styles.notesBlock}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesText}>{notes}</Text>
        </View>

        {/* Payment Options / Terms & Conditions / Bank details */}
        <View style={styles.paymentBlock}>
          <Text style={styles.paymentOptionsLabel}>Payment Options</Text>
          <Text style={styles.termsLabel}>Terms & Conditions</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Beneficiary</Text>
            <Text style={styles.paymentValue}>: {INVOICE_PAYMENT_DETAILS.beneficiary}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Sort code</Text>
            <Text style={styles.paymentValue}>: {INVOICE_PAYMENT_DETAILS.sortCode}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Account number</Text>
            <Text style={styles.paymentValue}>: {INVOICE_PAYMENT_DETAILS.accountNumber}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Address</Text>
            <Text style={styles.paymentValue}>: {INVOICE_PAYMENT_DETAILS.bankAddress}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
