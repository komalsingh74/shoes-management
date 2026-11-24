// Mock data — replace each export with a Django API call later.
export type Rec = Record<string, string>
export const STATES = ["Uttar Pradesh", "Punjab", "Haryana", "Maharashtra", "Gujarat", "Delhi", "West Bengal", "Tamil Nadu"]
export const FACTORY_TYPES = ["Cutting & Clicking", "Stitching", "Lasting & Sole Attach", "Finishing & Packing", "Integrated Unit"]

export const companies: Rec[] = [
  { code: "AFP", name: "Agra Footwear Pvt Ltd", legal: "Agra Footwear Private Limited", gst: "09AABCA1234F1Z5", pan: "AABCA1234F", email: "info@agrafootwear.in", phone: "9839012345", address: "Sikandra Industrial Area", state: "Uttar Pradesh", city: "Agra", pincode: "282007", contact: "Rakesh Gupta", status: "Active" },
  { code: "KSL", name: "Kanpur Sole Works", legal: "Kanpur Sole Works LLP", gst: "09AAFFK5678L1Z2", pan: "AAFFK5678L", email: "hello@kanpursole.in", phone: "9415098765", address: "Jajmau Road", state: "Uttar Pradesh", city: "Kanpur", pincode: "208010", contact: "Anil Mishra", status: "Active" },
  { code: "DLX", name: "Delhi Luxe Leather", legal: "Delhi Luxe Leather Pvt Ltd", gst: "07AACCD9012M1Z8", pan: "AACCD9012M", email: "ops@delhiluxe.in", phone: "9810011223", address: "Okhla Phase II", state: "Delhi", city: "New Delhi", pincode: "110020", contact: "Pooja Verma", status: "Inactive" },
]
export const factories: Rec[] = [
  { code: "AFP-U1", name: "Agra Unit 1 – Stitching", company: "Agra Footwear Pvt Ltd", type: "Stitching", gst: "09AABCA1234F1Z5", address: "Plot 14, Sikandra", state: "Uttar Pradesh", city: "Agra", pincode: "282007", contact: "Mohit Sharma", phone: "9839011111", email: "u1@agrafootwear.in", status: "Active" },
  { code: "AFP-U2", name: "Agra Unit 2 – Lasting", company: "Agra Footwear Pvt Ltd", type: "Lasting & Sole Attach", gst: "09AABCA1234F1Z5", address: "Plot 22, Sikandra", state: "Uttar Pradesh", city: "Agra", pincode: "282007", contact: "Sunil Yadav", phone: "9839022222", email: "u2@agrafootwear.in", status: "Active" },
  { code: "KSL-U1", name: "Kanpur Cutting Unit", company: "Kanpur Sole Works", type: "Cutting & Clicking", gst: "09AAFFK5678L1Z2", address: "Jajmau Road, Block C", state: "Uttar Pradesh", city: "Kanpur", pincode: "208010", contact: "Deepak Singh", phone: "9415011122", email: "cut@kanpursole.in", status: "Active" },
  { code: "KSL-U2", name: "Kanpur Finishing Unit", company: "Kanpur Sole Works", type: "Finishing & Packing", gst: "09AAFFK5678L1Z2", address: "Jajmau Road, Block F", state: "Uttar Pradesh", city: "Kanpur", pincode: "208010", contact: "Ravi Tiwari", phone: "9415033344", email: "fin@kanpursole.in", status: "Inactive" },
  { code: "DLX-U1", name: "Okhla Integrated Unit", company: "Delhi Luxe Leather", type: "Integrated Unit", gst: "07AACCD9012M1Z8", address: "Okhla Phase II, D-9", state: "Delhi", city: "New Delhi", pincode: "110020", contact: "Pooja Verma", phone: "9810044556", email: "unit@delhiluxe.in", status: "Inactive" },
]

const R = (code: string, name: string, description: string, users: number): Rec => ({ code, name, description, type: "System", users: String(users), status: "Active", responsibilities: description, approval: "None" })
export const roles: Rec[] = [
  R("SYS_ADMIN", "System Admin", "Full system configuration and user control", 2),
  R("OWNER", "Management / Owner", "Business oversight and final approvals", 2),
  R("SALES_MGR", "Sales Manager", "Customer orders, pricing and sales approvals", 3),
  R("MERCH", "Merchandiser / Order Executive", "Order follow-up and sample coordination", 5),
  R("PROD_ENG", "Product Engineer", "Article specs, BOM and pattern development", 4),
  R("PURCHASE", "Purchase Officer", "Supplier quotes, POs and procurement", 3),
  R("STORE", "Store Keeper", "Material receipt, issue and stock records", 4),
  R("PROD_MGR", "Production Manager", "Production planning and line performance", 2),
  R("LINE_SUP", "Line Supervisor", "Shop-floor line execution and output entry", 9),
  R("QC_INSP", "QC Inspector", "In-line and final quality inspection", 6),
  R("DISPATCH", "Dispatch Executive", "Packing lists, dispatch and delivery tracking", 3),
  R("ACCOUNTS", "Accounts Executive", "Invoices, payments and ledgers", 3),
  R("HR", "HR / Payroll Executive", "Workforce, attendance and payroll", 2),
]
roles.push({ code: "SAMPLE_LEAD", name: "Sampling Lead", description: "Sample room coordination", type: "Custom", users: "1", status: "Inactive", responsibilities: "Sample approvals", approval: "Level 1" })

const M = (n: number, name: string, description: string): Rec => ({ code: "M" + String(n).padStart(2, "0"), name, description, parent: "", order: String(n), status: "Active" })
export const modules: Rec[] = [
  M(1, "User Role & Configuration", "Users, roles, permissions and assignments"), M(2, "Dashboard", "Live plant and business overview"),
  M(3, "Master", "Suppliers, materials, lasts and size masters"), M(4, "Product Engineering", "Articles, BOM, patterns and costing"),
  M(5, "Sales", "Customer orders, quotes and order tracking"), M(6, "Production", "Planning, cutting, stitching, lasting and finishing"),
  M(7, "Product", "Finished article and style catalogue"), M(8, "QC", "Inspection, defects and approvals"),
  M(9, "Inventory", "Stock levels, batches and valuation"), M(10, "Purchase & Procurement", "Requisitions, quotations and purchase orders"),
  M(11, "Store", "Goods receipt, issue and returns"), M(12, "Dispatch & Delivery", "Packing, dispatch and proof of delivery"),
  M(13, "Accounts & Finance", "Billing, payments and ledgers"), M(14, "HR & Workforce", "Attendance, piece-rate and payroll"),
  M(15, "Maintenance", "Machine upkeep and breakdown logs"), M(16, "Reports & Analytics", "Operational and financial reports"),
]

const U = (n: number, first: string, last: string, company: string, factory: string, role: string, status: string, created: string): Rec => ({ empId: "EMP-" + String(n).padStart(3, "0"), first, last, username: (first + "." + last).toLowerCase(), email: `${first}.${last}@shoeflow.in`.toLowerCase(), phone: "98" + String(10000000 + n * 481923).slice(0, 8), company, factory, role, status, created })
export const users: Rec[] = [
  U(1, "Amit", "Kumar", "Agra Footwear Pvt Ltd", "AFP-U1", "System Admin", "Active", "2026-01-12"),
  U(2, "Neha", "Sharma", "Agra Footwear Pvt Ltd", "AFP-U1", "Sales Manager", "Active", "2026-03-04"),
  U(3, "Rohit", "Agarwal", "Agra Footwear Pvt Ltd", "AFP-U2", "Production Manager", "Active", "2026-04-18"),
  U(4, "Priya", "Singh", "Kanpur Sole Works", "KSL-U1", "QC Inspector", "Active", "2026-06-22"),
  U(5, "Manish", "Verma", "Kanpur Sole Works", "KSL-U2", "Store Keeper", "Inactive", "2026-07-09"),
  U(6, "Sana", "Khan", "Agra Footwear Pvt Ltd", "AFP-U2", "Purchase Officer", "Active", "2026-11-10"),
  U(7, "Vikas", "Yadav", "Kanpur Sole Works", "KSL-U1", "Line Supervisor", "Active", "2026-11-18"),
  U(8, "Anjali", "Mishra", "Delhi Luxe Leather", "DLX-U1", "Accounts Executive", "Inactive", "2026-11-21"),
]

export interface Assignment { id: string; empId: string; company: string; factory: string; roles: string[]; primary: string; by: string; date: string; status: string; history: { at: string; note: string }[] }
export const assignments: Assignment[] = [
  { id: "A1", empId: "EMP-001", company: "Agra Footwear Pvt Ltd", factory: "", roles: ["System Admin", "Management / Owner"], primary: "System Admin", by: "Alex Morgan", date: "2026-01-12", status: "Active", history: [{ at: "2026-01-12", note: "Assignment created" }] },
  { id: "A2", empId: "EMP-003", company: "Agra Footwear Pvt Ltd", factory: "AFP-U2", roles: ["Production Manager"], primary: "Production Manager", by: "Amit Kumar", date: "2026-04-18", status: "Active", history: [{ at: "2026-04-18", note: "Assignment created" }] },
  { id: "A3", empId: "EMP-003", company: "Agra Footwear Pvt Ltd", factory: "AFP-U1", roles: ["Line Supervisor", "QC Inspector"], primary: "Line Supervisor", by: "Amit Kumar", date: "2026-05-02", status: "Active", history: [{ at: "2026-05-02", note: "Assignment created" }, { at: "2026-08-14", note: "Role added: QC Inspector" }] },
  { id: "A4", empId: "EMP-004", company: "Kanpur Sole Works", factory: "KSL-U1", roles: ["QC Inspector"], primary: "QC Inspector", by: "Amit Kumar", date: "2026-06-22", status: "Active", history: [{ at: "2026-06-22", note: "Assignment created" }] },
  { id: "A5", empId: "EMP-005", company: "Kanpur Sole Works", factory: "KSL-U2", roles: ["Store Keeper"], primary: "Store Keeper", by: "Amit Kumar", date: "2026-07-09", status: "Inactive", history: [{ at: "2026-07-09", note: "Assignment created" }, { at: "2026-10-01", note: "Deactivated" }] },
  { id: "A6", empId: "EMP-002", company: "Agra Footwear Pvt Ltd", factory: "", roles: ["Sales Manager"], primary: "Sales Manager", by: "Alex Morgan", date: "2026-03-04", status: "Active", history: [{ at: "2026-03-04", note: "Assignment created" }] },
]