import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Personnel } from "../backend";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "../contexts/NavigationContext";
import { useActor } from "../hooks/useActor";

interface PermissionRole {
  id: string;
  name: string;
  modules: string[];
  companyId: string;
  createdAt: bigint;
}

interface PersonnelPermission {
  loginCode: string;
  companyId: string;
  roleId: string;
  additionalModules: string[];
  removedModules: string[];
}

interface PermissionActor {
  getPermissionRoles(adminCode: string): Promise<PermissionRole[]>;
  addPermissionRole(
    adminCode: string,
    roleName: string,
    modules: string[],
  ): Promise<PermissionRole>;
  updatePermissionRole(
    adminCode: string,
    roleId: string,
    roleName: string,
    modules: string[],
  ): Promise<PermissionRole>;
  deletePermissionRole(adminCode: string, roleId: string): Promise<boolean>;
  getCompanyPersonnel(adminCode: string): Promise<Array<Personnel>>;
  getPersonnelPermission(
    adminCode: string,
    loginCode: string,
  ): Promise<PersonnelPermission | null>;
  setPersonnelPermission(
    adminCode: string,
    loginCode: string,
    roleId: string,
    additionalModules: string[],
    removedModules: string[],
  ): Promise<PersonnelPermission>;
}

const MODULE_GROUPS = [
  {
    label: "Ana Ekran",
    modules: [
      { page: "dashboard", label: "Dashboard" },
      { page: "kpi-dashboard", label: "KPI Dashboard" },
      { page: "reports", label: "Raporlama" },
      { page: "alerts", label: "Bildirimler" },
      { page: "settings", label: "Ayarlar" },
    ],
  },
  {
    label: "İnsan Kaynakları",
    modules: [
      { page: "personnel", label: "Personel" },
      { page: "hr", label: "İnsan Kaynakları" },
      { page: "staffing-plan", label: "Norm Kadro" },
      { page: "leave", label: "İzin Yönetimi" },
      { page: "absence-tracking", label: "Devamsızlık Takibi" },
      { page: "shifts", label: "Vardiya Planlama" },
      { page: "personnel-shift-schedule", label: "Vardiya Çizelgesi" },
      { page: "shift-reports", label: "Vardiya Raporları" },
      { page: "personnel-rotation", label: "Personel Rotasyonu" },
      { page: "personnel-handover", label: "Görev Devri" },
      { page: "career-planning", label: "Kariyer Planlama" },
      { page: "perf-review", label: "Performans Değlendirme" },
      { page: "skills-matrix", label: "Yetenek Matrisi" },
      { page: "satisfaction-surveys", label: "Memnuniyet Anketi" },
      { page: "job-applications", label: "İş Başvuruları" },
      { page: "training", label: "Eğitim & Sertifika" },
      { page: "training-program", label: "Eğitim Programı" },
      { page: "training-certs", label: "Eğitim Sertifikaları" },
      { page: "salary-tracking", label: "Maaş & Ücret Takibi" },
      { page: "leave-requests", label: "İzin Talep Yönetimi" },
    ],
  },
  {
    label: "Üretim & Kalite",
    modules: [
      { page: "production", label: "Üretim Takibi" },
      { page: "quality", label: "Kalite Kontrol" },
      { page: "qc-forms", label: "Kalite Kontrol Formu" },
      { page: "production-quality", label: "Üretim Kalite Raporu" },
      { page: "quality-targets", label: "Kalite Hedefleri" },
      { page: "capacity", label: "Kapasite Planlama" },
      { page: "molds", label: "Kalıp & Aparat Takibi" },
    ],
  },
  {
    label: "Bakım & Ekipman",
    modules: [
      { page: "machines", label: "Makineler" },
      { page: "maintenance", label: "Bakım" },
      { page: "faults", label: "Arıza Takibi" },
      { page: "workorders", label: "İş Emirleri" },
      { page: "maintenance-calendar", label: "Bakım Takvimi" },
      { page: "maintenance-cost", label: "Bakım Maliyeti" },
      { page: "maintenance-budget", label: "Bakım Bütçe Planlama" },
      { page: "calibration", label: "Kalibrasyon Takibi" },
      { page: "equipment-maintenance", label: "Ekipman Bakım Geçmişi" },
      { page: "equipment-rental", label: "Ekipman Kiralama" },
      { page: "equipment-lifecycle", label: "Ekipman Ömür Takibi" },
      { page: "equipment-fault-analysis", label: "Ekipman Arıza Analizi" },
      { page: "equipment-energy", label: "Ekipman Enerji Tüketimi" },
      { page: "equipment-utilization", label: "Teçhizat Kullanım Analizi" },
      { page: "mtbf", label: "MGBF Yönetimi" },
      { page: "spare-parts", label: "Yedek Parça Takibi" },
      { page: "spare-parts-orders", label: "Yedek Parça Siparilşleri" },
    ],
  },
  {
    label: "Tedarik & Depo",
    modules: [
      { page: "suppliers", label: "Tedarikçiler" },
      { page: "supplier-eval", label: "Tedarikçi Değlendirme" },
      { page: "supplier-orders", label: "Tedarikçi Siparilşleri" },
      { page: "supplier-contracts", label: "Tedarikçi Sözleşmeleri" },
      { page: "supplier-scorecard", label: "Tedarikçi Skorkartı" },
      { page: "supplier-complaints", label: "Tedarikçi şikayetleri" },
      { page: "purchase-requests", label: "Satın Alma Talepleri" },
      { page: "supplychain", label: "Tedarik Zinciri" },
      { page: "stockcount", label: "Stok Sayımı" },
      { page: "inventory", label: "Envanter" },
      { page: "chemicals", label: "Kimyasal & Tehlikeli Madde" },
      { page: "warehouse", label: "Depo Yönetimi" },
      { page: "raw-materials", label: "Hammadde Takibi" },
    ],
  },
  {
    label: "Güvenlik & Çevre",
    modules: [
      { page: "safety", label: "İSG" },
      { page: "safety-incident", label: "Güvenlik Olayı Takibi" },
      { page: "occupational-health", label: "İş Sağlığı Takibi" },
      { page: "security-tours", label: "Güvenlik Turu Takibi" },
      { page: "environment", label: "Çevre & Atık" },
      { page: "env-measurements", label: "Çevre Ölçüm Takibi" },
      { page: "waste-disposal", label: "Atık Bertaraf Takibi" },
      { page: "waste-recycling", label: "Atık Geri Dönüşüm Takibi" },
      { page: "root-cause-analysis", label: "Kök Neden Analizi" },
    ],
  },
  {
    label: "Finans & Bütçe",
    modules: [
      { page: "budget", label: "Bütçe" },
      { page: "budget-revision", label: "Bütçe Revizyon Takibi" },
      { page: "costanalysis", label: "Maliyet Analizi" },
      { page: "general-expenses", label: "Genel Gider Yönetimi" },
      { page: "facility-maint-cost", label: "Tesis Bakım Maliyeti" },
      { page: "invoice-management", label: "Fatura Yönetimi" },
    ],
  },
  {
    label: "Proje Yönetimi",
    modules: [
      { page: "projects", label: "Projeler" },
      { page: "tasks", label: "Görevler" },
      { page: "milestones", label: "Kilometre Taşları" },
      { page: "project-risks", label: "Proje Risk Kaydı" },
      { page: "project-changes", label: "Proje Değişiklik Yönetimi" },
      { page: "project-resources", label: "Proje Kaynakları" },
      { page: "project-status-reports", label: "Proje Durum Raporları" },
      { page: "project-closure", label: "Proje Kapanış Raporu" },
      { page: "action-plans", label: "Aksiyon Planları" },
      { page: "workflows", label: "İş Akışı Yönetimi" },
    ],
  },
  {
    label: "Tesis & Altyapı",
    modules: [
      { page: "assets", label: "Sabit Kıymetler" },
      { page: "vehicles", label: "Araç & Taşıt Takibi" },
      { page: "vehicle-inspection", label: "Araç Muayene Takibi" },
      { page: "lease-management", label: "Kira Yönetimi" },
      { page: "facility-damage", label: "Tesis Hasarı" },
      { page: "facility-maint-plan", label: "Tesis Bakım Planı" },
      { page: "facility-cleaning", label: "Tesis Temizlik Planı" },
      { page: "energy-map", label: "Tesis Enerji Haritası" },
      { page: "energy", label: "Enerji Takibi" },
      { page: "energy-targets", label: "Enerji Verimliliği Hedefleri" },
      { page: "elec-mech-projects", label: "Elektrik/Mekanik Proje" },
      { page: "subcontractor", label: "Taşeron İş Takibi" },
    ],
  },
  {
    label: "Doküman & Uyum",
    modules: [
      { page: "documents", label: "Dokümanlar" },
      { page: "sop-library", label: "SOP Kütüphanesi" },
      { page: "doc-revision", label: "Doküman Revizyon Takibi" },
      { page: "material-certs", label: "Malzeme Sertifika Takibi" },
      { page: "legal-compliance", label: "Hukuki Uyum Takibi" },
      { page: "insurance", label: "Sigorta Poliçeleri" },
      { page: "contracts", label: "Sözleşmeler" },
      { page: "warranty", label: "Garanti Takibi" },
      { page: "personnel-auth", label: "Personel Yetki Matrisi" },
    ],
  },
  {
    label: "Denetim & İletişim",
    modules: [
      { page: "risk", label: "Risk Yönetimi" },
      { page: "audits", label: "Denetim & Teftiş" },
      { page: "field-audits", label: "Saha Denetimi" },
      { page: "inspection-management", label: "Muayene & Gözetim" },
      { page: "complaints", label: "Şikayet & Geri Bildirim" },
      { page: "performance", label: "Performans" },
      { page: "contact-directory", label: "İletişim Rehberi" },
      { page: "visitors", label: "Ziyaretçi Takibi" },
      { page: "customer-orders", label: "Müşteri Siparilşleri" },
    ],
  },
];

const ALL_MODULE_PAGES = MODULE_GROUPS.flatMap((g) =>
  g.modules.map((m) => m.page),
);

function ModuleCheckboxGrid({
  selected,
  onToggle,
  onSelectAll,
  onClearAll,
}: {
  selected: Set<string>;
  onToggle: (page: string) => void;
  onSelectAll: (pages: string[]) => void;
  onClearAll: (pages: string[]) => void;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(MODULE_GROUPS.map((g) => g.label)),
  );

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {MODULE_GROUPS.map((group) => {
        const isExpanded = expandedGroups.has(group.label);
        const groupPages = group.modules.map((m) => m.page);
        const checkedCount = groupPages.filter((p) => selected.has(p)).length;
        const allChecked = checkedCount === groupPages.length;

        return (
          <div
            key={group.label}
            className="border border-slate-200 rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50">
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="text-slate-400" />
                ) : (
                  <ChevronRight size={14} className="text-slate-400" />
                )}
                <span className="text-sm font-semibold text-slate-700">
                  {group.label}
                </span>
                <span className="text-xs text-slate-400 ml-1">
                  ({checkedCount}/{groupPages.length})
                </span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelectAll(groupPages)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 px-1.5 py-0.5 rounded hover:bg-indigo-50 transition-colors"
                >
                  Tümünü Seç
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => onClearAll(groupPages)}
                  className="text-xs text-slate-500 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                >
                  Temizle
                </button>
              </div>
            </div>
            {isExpanded && (
              <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {group.modules.map((mod) => (
                  <div
                    key={mod.page}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <Checkbox
                      id={mod.page}
                      checked={selected.has(mod.page)}
                      onCheckedChange={() => onToggle(mod.page)}
                      className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <label
                      htmlFor={mod.page}
                      className="text-xs text-slate-600 group-hover:text-slate-800 leading-tight cursor-pointer"
                    >
                      {mod.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
            {!isExpanded && allChecked && (
              <div className="px-3 py-1.5 bg-indigo-50 border-t border-indigo-100">
                <p className="text-xs text-indigo-600">Tüm modüller seçildi</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PermissionRolesPage() {
  const { session } = useAuth();
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as PermissionActor | null;
  const { navigate } = useNavigation();

  const [roles, setRoles] = useState<PermissionRole[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [permissionsMap, setPermissionsMap] = useState<
    Record<string, PersonnelPermission>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Role dialog state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<PermissionRole | null>(null);
  const [roleName, setRoleName] = useState("");
  const [selectedModules, setSelectedModules] = useState<Set<string>>(
    new Set(),
  );

  // Permission dialog state
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [permRoleId, setPermRoleId] = useState("none");
  const [additionalMods, setAdditionalMods] = useState<Set<string>>(new Set());
  const [removedMods, setRemovedMods] = useState<Set<string>>(new Set());
  const [permOverrideTab, setPermOverrideTab] = useState("additional");

  // Redirect non-admins
  useEffect(() => {
    if (session && session.userType !== "admin") {
      navigate("dashboard");
    }
  }, [session, navigate]);

  useEffect(() => {
    if (!actor || !session) return;
    setLoading(true);
    const adminCode = session.userCode;
    Promise.all([
      actor.getPermissionRoles(adminCode),
      actor.getCompanyPersonnel(adminCode),
    ])
      .then(([rolesData, personnelData]) => {
        setRoles(rolesData);
        setPersonnel(personnelData);
        return Promise.all(
          personnelData.map((p) =>
            actor
              .getPersonnelPermission(adminCode, p.loginCode)
              .then(
                (perm) =>
                  [p.loginCode, perm] as [string, PersonnelPermission | null],
              ),
          ),
        ).then((permEntries) => {
          const permsMap: Record<string, PersonnelPermission> = {};
          for (const [code, perm] of permEntries) {
            if (perm) permsMap[code] = perm;
          }
          setPermissionsMap(permsMap);
        });
      })
      .catch((e: unknown) => {
        toast.error(
          `Veri yüklenemedi: ${e instanceof Error ? e.message : "Bilinmeyen hata"}`,
        );
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor, session]);

  // Role dialog handlers
  const openCreateRole = () => {
    setEditingRole(null);
    setRoleName("");
    setSelectedModules(new Set());
    setRoleDialogOpen(true);
  };

  const openEditRole = (role: PermissionRole) => {
    setEditingRole(role);
    setRoleName(role.name);
    setSelectedModules(new Set(role.modules));
    setRoleDialogOpen(true);
  };

  const saveRole = async () => {
    if (!actor || !session || !roleName.trim()) {
      toast.error("Rol adı gerekli");
      return;
    }
    setSaving(true);
    try {
      const modules = Array.from(selectedModules);
      if (editingRole) {
        const updated = await actor.updatePermissionRole(
          session.userCode,
          editingRole.id,
          roleName.trim(),
          modules,
        );
        setRoles((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r)),
        );
        toast.success("Rol güncellendi");
      } else {
        const created = await actor.addPermissionRole(
          session.userCode,
          roleName.trim(),
          modules,
        );
        setRoles((prev) => [...prev, created]);
        toast.success("Rol oluşturuldu");
      }
      setRoleDialogOpen(false);
    } catch (e) {
      toast.error(
        `Hata: ${e instanceof Error ? e.message : "Bilinmeyen hata"}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!actor || !session) return;
    setDeleting(roleId);
    try {
      await actor.deletePermissionRole(session.userCode, roleId);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      toast.success("Rol silindi");
    } catch (e) {
      toast.error(
        `Hata: ${e instanceof Error ? e.message : "Bilinmeyen hata"}`,
      );
    } finally {
      setDeleting(null);
    }
  };

  // Permission dialog handlers
  const openPermDialog = (person: Personnel) => {
    setEditingPerson(person);
    const existing = permissionsMap[person.loginCode];
    if (existing) {
      setPermRoleId(existing.roleId || "none");
      setAdditionalMods(new Set(existing.additionalModules));
      setRemovedMods(new Set(existing.removedModules));
    } else {
      setPermRoleId("none");
      setAdditionalMods(new Set());
      setRemovedMods(new Set());
    }
    setPermOverrideTab("additional");
    setPermDialogOpen(true);
  };

  const savePerm = async () => {
    if (!actor || !session || !editingPerson) return;
    setSaving(true);
    try {
      const perm = await actor.setPersonnelPermission(
        session.userCode,
        editingPerson.loginCode,
        permRoleId === "none" ? "" : permRoleId,
        Array.from(additionalMods),
        Array.from(removedMods),
      );
      setPermissionsMap((prev) => ({
        ...prev,
        [editingPerson.loginCode]: perm,
      }));
      setPermDialogOpen(false);
      toast.success("Yetki kaydedildi");
    } catch (e) {
      toast.error(
        `Hata: ${e instanceof Error ? e.message : "Bilinmeyen hata"}`,
      );
    } finally {
      setSaving(false);
    }
  };

  // Module toggle helpers
  const toggleModule =
    (setter: (fn: (prev: Set<string>) => Set<string>) => void) =>
    (page: string) => {
      setter((prev) => {
        const next = new Set(prev);
        if (next.has(page)) next.delete(page);
        else next.add(page);
        return next;
      });
    };

  const selectAllInSet =
    (setter: (fn: (prev: Set<string>) => Set<string>) => void) =>
    (pages: string[]) => {
      setter((prev) => {
        const next = new Set(prev);
        for (const p of pages) next.add(p);
        return next;
      });
    };

  const clearAllInSet =
    (setter: (fn: (prev: Set<string>) => Set<string>) => void) =>
    (pages: string[]) => {
      setter((prev) => {
        const next = new Set(prev);
        for (const p of pages) next.delete(p);
        return next;
      });
    };

  // Effective modules for preview
  const getEffectiveModules = (): Set<string> => {
    const role = roles.find((r) => r.id === permRoleId);
    const base = new Set<string>(role ? role.modules : []);
    for (const m of additionalMods) base.add(m);
    for (const m of removedMods) base.delete(m);
    return base;
  };

  const getRoleName = (
    perm: PersonnelPermission | undefined,
  ): string | null => {
    if (!perm?.roleId) return null;
    return roles.find((r) => r.id === perm.roleId)?.name ?? null;
  };

  if (!session || session.userType !== "admin") return null;

  const effectiveModules = getEffectiveModules();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
            }}
          >
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                background: "linear-gradient(135deg, #1A1340 0%, #4F46E5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Yetki Yönetimi
            </h1>
            <p className="text-slate-500 text-sm">
              Roller oluşturun, modül yetkilerini yönetin
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="roles">
        <TabsList className="mb-6 bg-slate-100">
          <TabsTrigger
            value="roles"
            className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            data-ocid="permissions.roles.tab"
          >
            Roller
          </TabsTrigger>
          <TabsTrigger
            value="personnel"
            className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            data-ocid="permissions.personnel.tab"
          >
            Personel Yetkileri
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: ROLES ===== */}
        <TabsContent value="roles">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-semibold text-slate-800">Roller</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {roles.length} rol tanımlı
                </p>
              </div>
              <Button
                onClick={openCreateRole}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                data-ocid="permissions.roles.open_modal_button"
              >
                <Plus size={15} className="mr-1.5" />
                Yeni Rol
              </Button>
            </div>

            {loading ? (
              <div
                className="flex items-center justify-center py-16"
                data-ocid="permissions.roles.loading_state"
              >
                <Loader2 className="animate-spin text-indigo-400" size={28} />
              </div>
            ) : roles.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-center"
                data-ocid="permissions.roles.empty_state"
              >
                <ShieldCheck size={40} className="text-slate-200 mb-3" />
                <p className="text-slate-400 font-medium">
                  Henüz rol oluşturulmadı
                </p>
                <p className="text-slate-300 text-sm mt-1">
                  &quot;Yeni Rol&quot; butonuyla başlayın
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {roles.map((role, idx) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
                    data-ocid={`permissions.roles.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <ShieldCheck size={16} className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {role.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {role.modules.length} modül yetkisi
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-indigo-50 text-indigo-600 text-xs border-0"
                      >
                        {role.modules.length} modül
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditRole(role)}
                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        data-ocid={`permissions.roles.edit_button.${idx + 1}`}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRole(role.id)}
                        disabled={deleting === role.id}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                        data-ocid={`permissions.roles.delete_button.${idx + 1}`}
                      >
                        {deleting === role.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ===== TAB 2: PERSONNEL PERMISSIONS ===== */}
        <TabsContent value="personnel">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-semibold text-slate-800">
                  Personel Yetkileri
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {personnel.length} personel kaydı
                </p>
              </div>
            </div>

            {loading ? (
              <div
                className="flex items-center justify-center py-16"
                data-ocid="permissions.personnel.loading_state"
              >
                <Loader2 className="animate-spin text-indigo-400" size={28} />
              </div>
            ) : personnel.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-center"
                data-ocid="permissions.personnel.empty_state"
              >
                <Users size={40} className="text-slate-200 mb-3" />
                <p className="text-slate-400 font-medium">
                  Kayıtlı personel yok
                </p>
                <p className="text-slate-300 text-sm mt-1">
                  Önce personel ekleyin
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {personnel.map((person, idx) => {
                  const perm = permissionsMap[person.loginCode];
                  const roleName = getRoleName(perm);
                  const hasOverrides =
                    perm &&
                    (perm.additionalModules.length > 0 ||
                      perm.removedModules.length > 0);

                  return (
                    <div
                      key={person.loginCode}
                      className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
                      data-ocid={`permissions.personnel.item.${idx + 1}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold">
                          {person.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">
                            {person.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {person.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {roleName ? (
                          <Badge className="bg-indigo-50 text-indigo-600 text-xs border-0 font-medium">
                            {roleName}
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs text-slate-400"
                          >
                            Rol Yok
                          </Badge>
                        )}
                        {hasOverrides && (
                          <Badge
                            variant="outline"
                            className="text-xs text-orange-500 border-orange-200"
                          >
                            +Override
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPermDialog(person)}
                          className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          data-ocid={`permissions.personnel.edit_button.${idx + 1}`}
                        >
                          <Edit size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== ROLE CREATE/EDIT DIALOG ===== */}
      <Dialog
        open={roleDialogOpen}
        onOpenChange={(open) => {
          if (!saving) setRoleDialogOpen(open);
        }}
      >
        <DialogContent
          className="max-w-2xl"
          aria-describedby="role-dialog-desc"
          data-ocid="permissions.roles.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              {editingRole ? "Rol Düzenle" : "Yeni Rol Oluştur"}
            </DialogTitle>
            <DialogDescription id="role-dialog-desc">
              Rol adını girin ve bu role verilecek modül yetkilerini seçin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="role-name" className="mb-2 block text-slate-700">
                Rol Adı
              </Label>
              <Input
                id="role-name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Ör: Bakım Sorumlusu, İK Uzmanı..."
                className="focus-visible:ring-indigo-500"
                data-ocid="permissions.roles.input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-700">
                  Modül Yetkileri
                  <span className="ml-2 text-indigo-600 font-semibold">
                    ({selectedModules.size} seçili)
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedModules(new Set(ALL_MODULE_PAGES))
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                    data-ocid="permissions.roles.select_all.button"
                  >
                    Tamamını Seç
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedModules(new Set())}
                    className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                    data-ocid="permissions.roles.clear_all.button"
                  >
                    Temizle
                  </button>
                </div>
              </div>
              <ScrollArea className="h-72 rounded-lg border border-slate-200">
                <div className="p-3">
                  <ModuleCheckboxGrid
                    selected={selectedModules}
                    onToggle={toggleModule(setSelectedModules)}
                    onSelectAll={selectAllInSet(setSelectedModules)}
                    onClearAll={clearAllInSet(setSelectedModules)}
                  />
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={saving}
              data-ocid="permissions.roles.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={saveRole}
              disabled={saving || !roleName.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="permissions.roles.save_button"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : editingRole ? (
                "Rol Güncelle"
              ) : (
                "Rol Oluştur"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== PERSONNEL PERMISSION DIALOG ===== */}
      <Dialog
        open={permDialogOpen}
        onOpenChange={(open) => {
          if (!saving) setPermDialogOpen(open);
        }}
      >
        <DialogContent
          className="max-w-2xl"
          aria-describedby="perm-dialog-desc"
          data-ocid="permissions.personnel.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              Personel Yetki Ayarları
            </DialogTitle>
            <DialogDescription id="perm-dialog-desc">
              {editingPerson?.name} için rol atayın ve bireysel modül
              istisnaları tanımlayın.
            </DialogDescription>
          </DialogHeader>

          {editingPerson && (
            <div className="space-y-4">
              {/* Person info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {editingPerson.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {editingPerson.name}
                  </p>
                  <p className="text-xs text-slate-400">{editingPerson.role}</p>
                </div>
              </div>

              {/* Role selector */}
              <div>
                <Label className="mb-2 block text-slate-700">Rol Ata</Label>
                <Select
                  value={permRoleId}
                  onValueChange={(val) => setPermRoleId(val)}
                >
                  <SelectTrigger
                    className="focus:ring-indigo-500"
                    data-ocid="permissions.personnel.select"
                  >
                    <SelectValue placeholder="Rol seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Rol Yok (Tüm Erişim)</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} ({role.modules.length} modül)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {permRoleId === "none" && (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> Rol atanmadığında personel tüm modüllere
                    erişebilir
                  </p>
                )}
              </div>

              {/* Override tabs */}
              <div>
                <Label className="mb-2 block text-slate-700">
                  Bireysel İstisna Modülleri
                </Label>
                <div className="flex rounded-lg bg-slate-100 p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setPermOverrideTab("additional")}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                      permOverrideTab === "additional"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500"
                    }`}
                    data-ocid="permissions.personnel.additional.tab"
                  >
                    Ekstra Modüller
                    {additionalMods.size > 0 && (
                      <span className="ml-1 bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                        {additionalMods.size}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermOverrideTab("removed")}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                      permOverrideTab === "removed"
                        ? "bg-white text-red-500 shadow-sm"
                        : "text-slate-500"
                    }`}
                    data-ocid="permissions.personnel.removed.tab"
                  >
                    Kısıtlanan Modüller
                    {removedMods.size > 0 && (
                      <span className="ml-1 bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">
                        {removedMods.size}
                      </span>
                    )}
                  </button>
                </div>

                {permOverrideTab === "additional" && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">
                      Seçilen modüller, role bakılmaksızın personele ek olarak
                      açılır.
                    </p>
                    <ScrollArea className="h-56 rounded-lg border border-slate-200">
                      <div className="p-3">
                        <ModuleCheckboxGrid
                          selected={additionalMods}
                          onToggle={toggleModule(setAdditionalMods)}
                          onSelectAll={selectAllInSet(setAdditionalMods)}
                          onClearAll={clearAllInSet(setAdditionalMods)}
                        />
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {permOverrideTab === "removed" && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">
                      Seçilen modüller, rol bu modülleri içerse bile kapatılır.
                    </p>
                    <ScrollArea className="h-56 rounded-lg border border-slate-200">
                      <div className="p-3">
                        <ModuleCheckboxGrid
                          selected={removedMods}
                          onToggle={toggleModule(setRemovedMods)}
                          onSelectAll={selectAllInSet(setRemovedMods)}
                          onClearAll={clearAllInSet(setRemovedMods)}
                        />
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              {/* Effective modules preview */}
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-xs font-semibold text-indigo-700 mb-1.5">
                  Etkin Erişim:{" "}
                  <span className="font-bold">
                    {effectiveModules.size} modül
                  </span>
                  {permRoleId === "none" && (
                    <span className="ml-1 text-amber-600">(Tüm Erişim)</span>
                  )}
                </p>
                {permRoleId !== "none" && (
                  <p className="text-xs text-indigo-500">
                    Rol:{" "}
                    {roles.find((r) => r.id === permRoleId)?.modules.length ??
                      0}{" "}
                    + Ekstra: {additionalMods.size} − Kısıtlı:{" "}
                    {removedMods.size} = Toplam: {effectiveModules.size}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setPermDialogOpen(false)}
              disabled={saving}
              data-ocid="permissions.personnel.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={savePerm}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="permissions.personnel.save_button"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Yetkileri Kaydet"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
