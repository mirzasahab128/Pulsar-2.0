import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Linkedin, 
  PhoneCall, 
  FileText, 
  Bell, 
  Flame, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  PhoneForwarded,
  ArrowRight,
  Stethoscope,
  Sliders,
  Sun,
  Moon,
  Network,
  BarChart3,
  Crown,
  Lock,
  Eye,
  Code2,
  Layers,
  ChevronDown,
  X
} from 'lucide-react';
import { 
  RCMLead, 
  MeetingNote, 
  ActionItem, 
  DailyStats, 
  WarmTransferRecord, 
  ManagerSettings,
  PulsarSpatialModule
} from './types';
import { Header } from './components/Header';
import { SpatialSidebar } from './components/SpatialSidebar';
import { AdminAccessControlCenter } from './components/AdminAccessControlCenter';
import { PipelineWorkspace } from './components/PipelineWorkspace';
import { SpatialCommandBar } from './components/SpatialCommandBar';
import { SpatialCommandPalette } from './components/SpatialCommandPalette';
import { Dashboard } from './components/Dashboard';
import { LiquidGlassDashboard } from './components/LiquidGlassDashboard';
import { AuthGate } from './components/AuthGate';
import { AIAgentFleetWorkspace } from './components/AIAgentFleetWorkspace';
import { CampaignManagementWorkspace } from './components/CampaignManagementWorkspace';
import { IntegrationsAdminWorkspace } from './components/IntegrationsAdminWorkspace';
import { SpatialAICopilotPanel } from './components/SpatialAICopilotPanel';
import { LeadScraper } from './components/LeadScraper';
import { LinkedInFinder } from './components/LinkedInFinder';
import { CallStudio } from './components/CallStudio';
import { MeetingNotesView } from './components/MeetingNotesView';
import { RemindersTracker } from './components/RemindersTracker';
import { GoogleTasksWorkspace } from './components/GoogleTasksWorkspace';
import { GoogleFormsWorkspace } from './components/GoogleFormsWorkspace';
import { GoogleMapsTerritoryWorkspace } from './components/GoogleMapsTerritoryWorkspace';
import { DailyBriefingView } from './components/DailyBriefingView';
import { SkiperRadarScanner } from './components/SkiperRadarScanner';
import { NetworkBuilderMatrix } from './components/NetworkBuilderMatrix';
import { SalesBDVelocityHub } from './components/SalesBDVelocityHub';
import { NavigationDock } from './components/NavigationDock';
import { SettingsModal } from './components/SettingsModal';
import { AIChatbotModal } from './components/AIChatbotModal';
import { AudioTranscriberModal } from './components/AudioTranscriberModal';
import { GroundingIntelligenceModal } from './components/GroundingIntelligenceModal';
import { formatPSTDate } from './utils/pstTime';
import { apiService } from './services/api';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { useTheme } from './context/ThemeContext';
import { useDisplay } from './context/DisplayContext';
import { useAuth } from './context/AuthContext';
import { FuturisticOrbWorld } from './components/FuturisticOrbWorld';
import { ZoeyPulsarCore } from './components/ZoeyPulsarCore';
import { PWAInstallModal } from './components/PWAInstallModal';
import { DisplaySettingsModal } from './components/DisplaySettingsModal';
import { useVoiceCommandListener } from './hooks/useVoiceCommandListener';
import { AlwaysOnVoiceListener } from './components/AlwaysOnVoiceListener';
import { AuthModal } from './components/AuthModal';
import { CodebaseViewerModal } from './components/CodebaseViewerModal';
import { BusinessNicheLibraryModal } from './components/BusinessNicheLibraryModal';
import { NICHE_TEMPLATES, NicheTemplate, DEFAULT_NICHE_TEMPLATE } from './data/nicheTemplates';

// Helper to guarantee unique lead IDs across updates
export const deduplicateLeads = (leadList: RCMLead[]): RCMLead[] => {
  const seenIds = new Set<string>();
  const result: RCMLead[] = [];
  for (const l of leadList) {
    if (!l) continue;
    let finalId = l.id;
    if (!finalId || seenIds.has(finalId)) {
      finalId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    }
    seenIds.add(finalId);
    result.push({ ...l, id: finalId });
  }
  return result;
};

export default function App() {
  // Spatial Operating System Navigation
  const [activeModule, setActiveModule] = useState<PulsarSpatialModule>('command_center');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('pulsar_sidebar_collapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [useClassicDashboard, setUseClassicDashboard] = useState<boolean>(false);

  // Backward compatibility alias for any child passing activeTab / setActiveTab
  const activeTab = (activeModule === 'command_center' ? 'leads' : activeModule) as any;
  const setActiveTab = (tab: any) => {
    setActiveModule(tab as PulsarSpatialModule);
  };
  
  // AI Feature Modals state
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [isTranscriberOpen, setIsTranscriberOpen] = useState<boolean>(false);
  const [isGroundingOpen, setIsGroundingOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Google Maps Platform Quota Defense State (Two-Tier Monitoring)
  const [isMapsQuotaExceeded, setIsMapsQuotaExceeded] = useState<boolean>(false);
  useEffect(() => {
    const handleQuota = () => setIsMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Responsive Display Context
  const { containerClass, spacingClass, widthMode, setWidthMode } = useDisplay();
  
  // Settings
  const [settings, setSettings] = useState<ManagerSettings>(() => {
    const defaultSettings: ManagerSettings = {
      managerName: 'Sales & BD Manager',
      managerPhone: '+1 (555) 382-9104',
      managerEmail: '',
      companyName: 'Pulsar Solutions',
      transferMode: 'warm_intro_first',
      speechRate: 1.02,
      voiceGender: 'female',
      autoSchedule4PMBriefing: true,
      dailyBriefingEmail: '',
      telephonyCarrier: 'whatsapp_voip',
      sipEndpointUrl: 'sip:sales-bridge@pstn.pulsebilling.com',
      valuePropCleanClaimRate: '98.4%',
      valuePropRevenueBoost: '15-20% net collections increase',
      routeToWhatsApp: true,
      whatsAppNumber: '+1 (555) 382-9104',
      autoOpenWhatsAppOnTransfer: true,
      dailySummarySchedulerEnabled: true,
      dailySummaryScheduledTimePST: '16:00',
      dailySummaryRecipientEmail: '',
      dailySummaryIncludeCallPerformance: true,
      dailySummaryIncludeAuditPipeline: true
    };
    const saved = localStorage.getItem('pulsercm_settings');
    if (saved) {
      try { 
        return { ...defaultSettings, ...JSON.parse(saved) }; 
      } catch (e) {}
    }
    return defaultSettings;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCodebaseOpen, setIsCodebaseOpen] = useState<boolean>(false);
  const [isNicheLibraryOpen, setIsNicheLibraryOpen] = useState<boolean>(false);
  const [readOnlyNotice, setReadOnlyNotice] = useState<string | null>(null);

  // Authentication & Role-Based Access Control
  const { role, isReadOnly, isMasterAdmin, workspaceId, profile, setQuickProfile, openAuthModal, updateWorkspaceNiche, access } = useAuth();

  // Phases 1–3: plan upgrade notice shown when a locked nav item is selected
  const [upgradeNotice, setUpgradeNotice] = useState<{ featureKey: string; label: string } | null>(null);

  // Active Niche Template
  const [activeNicheTemplate, setActiveNicheTemplate] = useState<NicheTemplate>(() => {
    const savedId = localStorage.getItem('pulsar_active_niche_template_id');
    if (savedId) {
      const found = NICHE_TEMPLATES.find(t => t.id === savedId);
      if (found) return found;
    }
    return DEFAULT_NICHE_TEMPLATE;
  });

  // Isolated workspace ID derived from authenticated user's organization profile
  const activeWorkspaceId = workspaceId || (isMasterAdmin ? 'ws_pulsar_master' : 'ws_pulsar_customer');

  // Active call lead for CallStudio modal
  const [activeCallLead, setActiveCallLead] = useState<RCMLead | null>(null);

  // Ensure top hero section is loaded and preserved on tab changes or radar activations
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeTab]);

  // Daily statistics
  const [stats, setStats] = useState<DailyStats>({
    callsPlaced: 42,
    humanConnects: 19,
    warmTransfersBridged: 6,
    auditsBooked: 3,
    leadsScraped: 35,
    pipelineAdded: '$145,000 / mo',
    denialAuditValue: '$520,000'
  });

  // Warm transfers log
  const [warmTransfers, setWarmTransfers] = useState<WarmTransferRecord[]>([
    {
      id: 'wt-1',
      leadName: 'Dr. Marcus Vance, MD',
      practiceName: 'Austin Heart & Vascular Institute',
      phone: '(512) 892-4100',
      bridgedAt: '10:14 AM PST',
      durationWithManager: '4m 12s',
      triggerReason: 'Prospect asked about eClinicalWorks integration and fee percentage',
      outcome: 'Complimentary 50-Claim Audit Scheduled'
    },
    {
      id: 'wt-2',
      leadName: 'David Sterling (VP RCM)',
      practiceName: 'Northwest Orthopedic & Spine Surgery',
      phone: '(206) 781-9920',
      bridgedAt: '1:45 PM PST',
      durationWithManager: '6m 30s',
      triggerReason: 'Frustrated with workers comp surgical modifier underpayments',
      outcome: 'Zoom Clearinghouse Walkthrough Booked'
    },
    {
      id: 'wt-3',
      leadName: 'Robert Hughes (CFO)',
      practiceName: 'Apex Precision Diagnostic & Pathology Labs',
      phone: '(404) 636-7200',
      bridgedAt: '2:50 PM PST',
      durationWithManager: '3m 50s',
      triggerReason: 'Molecular pathology CPT denials causing $80k backlogs',
      outcome: 'Formal Lab Billing Proposal Requested'
    }
  ]);

  // Initial Leads
  const [leads, setLeads] = useState<RCMLead[]>([
    {
      id: 'lead-1',
      practiceName: 'Austin Heart & Vascular Institute',
      doctorName: 'Dr. Marcus Vance, MD, FACC',
      title: 'Managing Partner & Interventional Cardiologist',
      specialty: 'Cardiology & Electrophysiology',
      practiceSize: '6 Physicians, 2 PAs',
      phone: '(512) 892-4100',
      email: 'mvance@austinheartandvascular.com',
      address: '4201 Medical Pkwy, Suite 320, Austin, TX 78756',
      state: 'TX',
      ehrSystem: 'eClinicalWorks',
      monthlyClaimVolume: '$420,000 / mo (approx. 1,800 claims)',
      painPoints: ['High denial rates on cardiac catheterization coding (16%)', 'Days in AR lingering at 54 days', 'Front-desk prior auth bottlenecks'],
      tags: ['Target', 'VIP Practice'],
      linkedInProfile: 'https://linkedin.com/in/dr-marcus-vance-austin-heart',
      adminContact: 'Brenda Miller - Practice Administrator',
      source: 'Web & NPI Registry Scraper',
      status: 'Ready for Call'
    },
    {
      id: 'lead-2',
      practiceName: 'Northwest Orthopedic & Spine Surgery',
      doctorName: 'Dr. Elena Rostova, MD',
      title: 'Chief Medical Officer & Orthopedic Surgeon',
      specialty: 'Orthopedic Surgery & Sports Medicine',
      practiceSize: '9 Surgeons, 4 PT Facilities',
      phone: '(206) 781-9920',
      email: 'erostova@northwestorthospine.org',
      address: '1100 9th Ave, Seattle, WA 98101',
      state: 'WA',
      ehrSystem: 'AthenaHealth',
      monthlyClaimVolume: '$890,000 / mo (approx. 3,400 claims)',
      painPoints: ['Workers comp & out-of-network fee schedule underpayments', 'Denials for surgical modifier 59/25', 'Understaffed in-house billing department'],
      tags: ['Target', 'Follow-up Needed'],
      linkedInProfile: 'https://linkedin.com/in/elena-rostova-ortho-wa',
      adminContact: 'David Sterling - Director of Revenue Cycle',
      source: 'LinkedIn Health Discovery',
      status: 'Ready for Call'
    },
    {
      id: 'lead-3',
      practiceName: 'Beacon Hill Pediatric & Adolescent Medicine',
      doctorName: 'Dr. Jonathan Blake, MD, FAAP',
      title: 'Founding Pediatrician',
      specialty: 'Pediatrics & Adolescent Care',
      practiceSize: '4 Pediatricians, 3 Nurse Practitioners',
      phone: '(617) 523-8840',
      email: 'jblake@beaconhillpediatrics.com',
      address: '15 Cambridge St, Boston, MA 02114',
      state: 'MA',
      ehrSystem: 'Epic (Community Connect)',
      monthlyClaimVolume: '$290,000 / mo (approx. 2,100 claims)',
      painPoints: ['Vaccine administration reimbursement disputes with Medicaid MCOs', 'Delayed credentialing for new mid-level providers', 'AR over 90 days exceeded 22%'],
      tags: ['Follow-up Needed'],
      linkedInProfile: 'https://linkedin.com/in/jonathan-blake-boston-peds',
      adminContact: 'Sarah Jennings - Clinic Operations Manager',
      source: 'Google Places & State Medical Board',
      status: 'Ready for Call'
    },
    {
      id: 'lead-4',
      practiceName: 'Apex Precision Diagnostic & Pathology Labs',
      doctorName: 'Dr. Anita Desai, MD, FCAP',
      title: 'Laboratory Medical Director',
      specialty: 'Independent Clinical & Pathology Laboratory',
      practiceSize: 'Commercial Testing Lab (3 Collection Centers)',
      phone: '(404) 636-7200',
      email: 'anita.desai@apexpathlabs.com',
      address: '2200 Century Pkwy NE, Atlanta, GA 30345',
      state: 'GA',
      ehrSystem: 'LigoLab LIS / Kareo Billing',
      monthlyClaimVolume: '$640,000 / mo (approx. 6,200 claims)',
      painPoints: ['Molecular pathology CPT code unbundling rejections', 'Massive Medicare LCD requirement denials', 'Need specialized laboratory billing team'],
      tags: ['Target', 'High Denial Rate'],
      linkedInProfile: 'https://linkedin.com/in/anita-desai-pathology',
      adminContact: 'Robert Hughes - Chief Financial Officer',
      source: 'CLIA Lab Directory Scraper',
      status: 'Ready for Call'
    },
    {
      id: 'lead-5',
      practiceName: 'Sunshine Coast Dermatology & Mohs Center',
      doctorName: 'Dr. Gregory Kim, MD, FAAD',
      title: 'Lead Dermatologist & Mohs Surgeon',
      specialty: 'Dermatology & Mohs Micrographic Surgery',
      practiceSize: '3 Dermatologists, 1 Dermatopathologist',
      phone: '(305) 538-4411',
      email: 'gkim@sunshinedermfl.com',
      address: '4300 Alton Rd, Suite 400, Miami Beach, FL 33140',
      state: 'FL',
      ehrSystem: 'Modernizing Medicine (EMA)',
      monthlyClaimVolume: '$510,000 / mo (approx. 2,600 claims)',
      painPoints: ['Biopsy pathology split-billing payment delays', 'Aging self-pay deductible collections', 'Denial overturn turnaround taking >60 days'],
      tags: ['Follow-up Needed'],
      linkedInProfile: 'https://linkedin.com/in/gregory-kim-fl-derm',
      adminContact: 'Claudia Morales - Office Billing Lead',
      source: 'LinkedIn Executive Search',
      status: 'Ready for Call'
    },
    {
      id: 'lead-6',
      practiceName: 'Great Lakes Regional Community Hospital',
      doctorName: 'Dr. Thomas Sterling, MD',
      title: 'VP of Medical Affairs & Physician Network',
      specialty: 'Critical Access Hospital & Multi-Specialty Clinic',
      practiceSize: '45 Bed Hospital + 3 Outpatient Clinics',
      phone: '(312) 942-5000',
      email: 'tsterling@greatlakeshealth.org',
      address: '1653 W Congress Pkwy, Chicago, IL 60612',
      state: 'IL',
      ehrSystem: 'Cerner / Oracle Health',
      monthlyClaimVolume: '$2,400,000 / mo',
      painPoints: ['Complex DRG cross-coding denials', 'Aged hospital accounts receivable exceeding $1.8M', 'Staff turnover in central billing office (CBO)'],
      tags: ['Target', 'VIP Practice'],
      linkedInProfile: 'https://linkedin.com/in/thomas-sterling-healthcare-exec',
      adminContact: 'Danielle Brooks - VP Revenue Cycle Management',
      source: 'AHA Hospital Directory Scraper',
      status: 'Ready for Call'
    }
  ]);

  // Initial Meeting Notes
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([
    {
      id: 'note-sample-1',
      leadId: 'lead-1',
      practiceName: 'Austin Heart & Vascular Institute',
      doctorName: 'Dr. Marcus Vance, MD, FACC',
      date: formatPSTDate(),
      duration: '4m 12s',
      executiveSummary: 'AI Agent Sarah dialed and introduced our cardiology clean-claim rate. When Dr. Vance asked how we interface with eClinicalWorks and address catheterization denials, Sarah immediately bridged the call to the Sales Manager on line 1. Dr. Vance was impressed by our certified cardiology coders and agreed to transmit 50 sample claims for a free audit.',
      qualificationStatus: 'Hot Lead',
      statedBillingPainPoints: [
        '16% initial denial rate on cardiac catheterization CPT 93458 codes',
        'Days in AR stretched out to 54 days with Blue Cross and Medicare Advantage',
        'Prior authorization bottlenecks causing scheduling delays'
      ],
      currentSoftwareAndStaffing: 'eClinicalWorks EHR with 2 in-house billers overwhelmed by appeals',
      commercialTermsDiscussed: 'Performance rate of 4.5% of net collections; zero setup fees; free 50-claim diagnostic audit.',
      decisionMakersIdentified: 'Dr. Marcus Vance (Managing Partner) and Brenda Miller (Practice Administrator)',
      actionItems: [
        {
          id: 'task-init-1',
          task: 'Send HIPAA-compliant Business Associate Agreement (BAA) and secure audit upload link to Brenda Miller',
          due: 'Tomorrow 9:30 AM PST',
          priority: 'Urgent',
          category: 'Audit Proposal',
          completed: false,
          practiceName: 'Austin Heart & Vascular Institute'
        },
        {
          id: 'task-init-2',
          task: 'Connect with Brenda Miller on LinkedIn with Cardiology Denial Reduction Whitepaper',
          due: 'Today 5:00 PM PST',
          priority: 'High',
          category: 'Email Followup',
          completed: false,
          practiceName: 'Austin Heart & Vascular Institute'
        }
      ],
      recommendedFollowUpStrategy: 'Deliver the 50-claim audit report within 48 hours highlighting their unbilled modifier 59 codes. Show how our audit directly recovers over $38,000 in previously abandoned denials.',
      transcript: [
        { id: '1', speaker: 'Prospect', text: 'Hello, Austin Heart and Vascular, this is Brenda.', timestamp: '10:14:02 AM' },
        { id: '2', speaker: 'AI Agent (Sarah)', text: 'Hi Brenda! This is Sarah with Pulsar. I am calling for Dr. Vance regarding your eClinicalWorks billing and cardiology claim denials. We recently helped a Texas heart clinic cut denial rates from 16% to 2.4%. Is Dr. Vance available for a quick moment?', timestamp: '10:14:08 AM', sentiment: 'positive' },
        { id: '3', speaker: 'Prospect', text: 'Dr. Vance is actually walking down the hall right now, let me see if he wants to take this. Hold on.', timestamp: '10:14:20 AM' },
        { id: '4', speaker: 'Prospect', text: 'This is Dr. Vance. What is this regarding?', timestamp: '10:14:32 AM' },
        { id: '5', speaker: 'AI Agent (Sarah)', text: 'Dr. Vance, thank you so much. I know you are in clinic—I have our Sales & Operations Manager on standby to look at your specific cath lab denial volume. Linking you directly right now!', timestamp: '10:14:40 AM', sentiment: 'positive' },
        { id: '6', speaker: 'System', text: '📞 Call bridged to Sales Manager line (+1 (555) 382-9104).', timestamp: '10:14:42 AM' },
        { id: '7', speaker: 'Manager (You)', text: 'Dr. Vance, pleasure to connect with you. Sarah mentioned your team is battling high cardiac catheterization denials on eCW. We provide certified AAPC cardiology coders and an aggressive denial overturn team.', timestamp: '10:14:50 AM' },
        { id: '8', speaker: 'Prospect', text: 'Yes, exactly. We lose thousands on unbundled modifier denials every month. How does your free audit work?', timestamp: '10:15:15 AM' },
        { id: '9', speaker: 'Manager (You)', text: 'We sign a quick BAA, you securely send us 50 sample redacted EOBs, and within 48 hours we provide a complete revenue leakage breakdown with exact dollars recovered. No charge, no obligation.', timestamp: '10:15:35 AM' },
        { id: '10', speaker: 'Prospect', text: 'Send the BAA to Brenda, and we will get that right over.', timestamp: '10:15:58 AM' }
      ]
    }
  ]);

  // Tasks and Reminders
  const [tasks, setTasks] = useState<ActionItem[]>([
    {
      id: 'task-scheduled-1',
      task: 'Scheduled Follow-Up Call: Dr. Marcus Vance (Austin Heart & Vascular) - Review 50-Claim Audit Results & Fee Schedule',
      due: 'Tomorrow, 10:00 AM PST',
      priority: 'Urgent',
      category: 'Phone Call',
      completed: false,
      leadId: 'lead-1',
      practiceName: 'Austin Heart & Vascular Institute',
      doctorName: 'Dr. Marcus Vance, MD, FACC',
      phone: '(512) 892-4100',
      isScheduledCall: true,
      scheduledDateTime: '2026-09-25T10:00',
      notes: 'Review catheterization modifier 59 denials and walk through fee schedule options.'
    },
    {
      id: 'task-scheduled-2',
      task: 'Scheduled Follow-Up Call: David Sterling (Northwest Orthopedic) - AthenaHealth Clearinghouse Denial Overturn Demo',
      due: 'Friday, 2:30 PM PST',
      priority: 'High',
      category: 'Phone Call',
      completed: false,
      leadId: 'lead-2',
      practiceName: 'Northwest Orthopedic & Spine Surgery',
      doctorName: 'David Sterling (VP RCM)',
      phone: '(206) 781-9920',
      isScheduledCall: true,
      scheduledDateTime: '2026-09-26T14:30',
      notes: 'Provide live demo of claims scrubber and explain zero-setup fee transition.'
    },
    {
      id: 'task-init-1',
      task: 'Send HIPAA BAA agreement and secure 50-claim upload link to Brenda Miller at Austin Heart',
      due: 'Tomorrow 9:30 AM PST',
      priority: 'Urgent',
      category: 'Audit Proposal',
      completed: false,
      practiceName: 'Austin Heart & Vascular Institute'
    },
    {
      id: 'task-init-2',
      task: 'Prepare AthenaHealth clearinghouse denial recovery deck for Northwest Orthopedic',
      due: 'Tomorrow 11:00 AM PST',
      priority: 'High',
      category: 'EHR Demo',
      completed: false,
      practiceName: 'Northwest Orthopedic & Spine'
    },
    {
      id: 'task-init-3',
      task: 'Follow up with Robert Hughes (Apex Diagnostic Labs CFO) on 4% lab billing tier proposal',
      due: 'Thursday 1:00 PM PST',
      priority: 'High',
      category: 'Contract',
      completed: false,
      practiceName: 'Apex Precision Diagnostic Labs'
    },
    {
      id: 'task-init-4',
      task: 'Send personalized InMail sequence to 10 Practice Administrators scraped on LinkedIn',
      due: 'Today 4:30 PM PST',
      priority: 'Medium',
      category: 'Email Followup',
      completed: false,
      practiceName: 'LinkedIn Outbound Batch'
    },
    {
      id: 'task-init-5',
      task: 'Verify Medicare CMS-1500 taxonomy code crosswalk for Texas pediatric and family medicine directory',
      due: 'Next Monday, 9:00 AM PST',
      priority: 'Low',
      category: 'Audit Proposal',
      completed: false,
      practiceName: 'Texas Regional CMS Database'
    }
  ]);

  // Save settings changes
  const handleSaveSettings = async (newSettings: ManagerSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pulsercm_settings', JSON.stringify(newSettings));
    try {
      await apiService.updateSchedulerConfig({
        enabled: newSettings.dailySummarySchedulerEnabled,
        scheduledTimePST: newSettings.dailySummaryScheduledTimePST,
        recipientEmail: newSettings.dailySummaryRecipientEmail || newSettings.managerEmail,
        includeCallPerformance: newSettings.dailySummaryIncludeCallPerformance,
        includeAuditPipeline: newSettings.dailySummaryIncludeAuditPipeline
      });
    } catch (e) {
      console.warn('Failed to sync scheduler settings to backend:', e);
    }
  };

  // Sync background scheduler on mount
  useEffect(() => {
    apiService.updateSchedulerConfig({
      enabled: settings.dailySummarySchedulerEnabled,
      scheduledTimePST: settings.dailySummaryScheduledTimePST,
      recipientEmail: settings.dailySummaryRecipientEmail || settings.managerEmail,
      includeCallPerformance: settings.dailySummaryIncludeCallPerformance,
      includeAuditPipeline: settings.dailySummaryIncludeAuditPipeline
    }).catch((e: unknown) => console.warn('Init scheduler sync:', e));
  }, []);

  // Listen to Firebase Auth and synchronize user data with Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch leads and meeting notes scoped to the active organization workspaceId
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      if (!firebaseUser && !activeWorkspaceId) return;
      try {
        // Fetch workspace's saved leads with tenant workspaceId filter
        const leadsRef = collection(db, 'leads');
        const leadsQuery = query(leadsRef, where('workspaceId', '==', activeWorkspaceId));
        const leadsSnap = await getDocs(leadsQuery);
        if (!leadsSnap.empty) {
          const wsLeads: RCMLead[] = [];
          leadsSnap.forEach((doc) => {
            wsLeads.push(doc.data() as RCMLead);
          });
          // Merge without duplicates
          setLeads((prev) => deduplicateLeads([...wsLeads, ...prev]));
        }

        // Fetch workspace's saved meeting notes with tenant workspaceId filter
        const notesRef = collection(db, 'meeting_notes');
        const notesQuery = query(notesRef, where('workspaceId', '==', activeWorkspaceId));
        const notesSnap = await getDocs(notesQuery);
        if (!notesSnap.empty) {
          const wsNotes: MeetingNote[] = [];
          notesSnap.forEach((doc) => {
            wsNotes.push(doc.data() as MeetingNote);
          });
          setMeetingNotes((prev) => {
            const existingIds = new Set(prev.map(n => n.id));
            const fresh = wsNotes.filter(n => !existingIds.has(n.id));
            return [...fresh, ...prev];
          });
        }
      } catch (dbErr) {
        console.warn('Firestore tenant workspace data load error:', dbErr);
      }
    };

    fetchWorkspaceData();
  }, [firebaseUser, activeWorkspaceId]);

  // Handler for selecting & auto-populating from Business Niche Library
  const handleSelectNicheTemplate = async (template: NicheTemplate) => {
    setActiveNicheTemplate(template);
    localStorage.setItem('pulsar_active_niche_template_id', template.id);

    // Auto-populate Pulsar AI agent instructions & Manager settings
    setSettings((prev) => ({
      ...prev,
      companyName: template.name.split('&')[0].trim() + ' Solutions',
      valuePropCleanClaimRate: template.agentConfig.keyMetricOrGuarantee,
      valuePropRevenueBoost: template.agentConfig.revenueImpact,
    }));

    // Update user profile organization niche
    if (updateWorkspaceNiche) {
      await updateWorkspaceNiche(template.id, template.name);
    }

    // Persist workspace profile to Firestore
    if (firebaseUser) {
      try {
        const wsDocRef = doc(db, 'workspaces', activeWorkspaceId);
        await setDoc(wsDocRef, {
          id: activeWorkspaceId,
          workspaceId: activeWorkspaceId,
          name: `${template.name} Workspace`,
          industry: template.category,
          niche: template.name,
          nicheTemplateId: template.id,
          agentConfig: template.agentConfig,
          targetPersona: template.targetPersona,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Workspace sync error:', err);
      }
    }
  };

  // When a call finishes in CallStudio
  const handleCallEnded = async (lead: RCMLead, note: MeetingNote) => {
    // Add or update meeting note in place
    setMeetingNotes((prev) => {
      const idx = prev.findIndex(n => n.id === note.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = note;
        return copy;
      }
      return [note, ...prev];
    });

    // Persist note to Firestore with tenant workspaceId
    if (firebaseUser) {
      try {
        const noteDocRef = doc(db, 'meeting_notes', note.id);
        await setDoc(noteDocRef, {
          ...note,
          userId: firebaseUser.uid,
          workspaceId: activeWorkspaceId,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Failed to sync note to Firestore:', e);
      }
    }

    // Add action items
    if (note.actionItems && note.actionItems.length > 0) {
      setTasks((prev) => [...note.actionItems, ...prev]);
    }

    // Add warm transfer record if call was bridged
    const wasBridged = note.transcript.some(t => t.speaker.includes('Manager'));
    if (wasBridged) {
      const wtRecord: WarmTransferRecord = {
        id: `wt-${Date.now()}`,
        leadName: lead.doctorName,
        practiceName: lead.practiceName,
        phone: lead.phone,
        bridgedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        durationWithManager: note.duration,
        triggerReason: 'Prospect engaged on RCM pain points and requested manager discussion',
        outcome: note.qualificationStatus
      };
      setWarmTransfers((prev) => [wtRecord, ...prev]);
    }

    // Update stats
    setStats((prev) => ({
      ...prev,
      callsPlaced: prev.callsPlaced + 1,
      humanConnects: prev.humanConnects + 1,
      warmTransfersBridged: wasBridged ? prev.warmTransfersBridged + 1 : prev.warmTransfersBridged,
      auditsBooked: note.qualificationStatus === 'Hot Lead' ? prev.auditsBooked + 1 : prev.auditsBooked
    }));

    // Update lead status
    setLeads((prev) => prev.map(l => l.id === lead.id ? { ...l, status: 'Audit Scheduled', lastContacted: 'Today' } : l));
  };

  const handleToggleTask = (taskId: string) => {
    // Phases 1–3: stamp completedAt when a task is completed so the
    // Dashboard follow-up health series reflects real completion dates.
    const stamp = (t: ActionItem): ActionItem => ({
      ...t,
      completed: !t.completed,
      completedAt: !t.completed ? new Date().toISOString() : undefined
    });
    setTasks((prev) => prev.map(t => t.id === taskId ? stamp(t) : t));
    setMeetingNotes((prev) => prev.map(n => ({
      ...n,
      actionItems: n.actionItems.map(a => a.id === taskId ? stamp(a) : a)
    })));
  };

  const handleAddTask = (task: ActionItem) => {
    setTasks((prev) => [task, ...prev]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter(t => t.id !== taskId));
  };

  const handleAddScrapedLeads = async (newLeads: RCMLead[]) => {
    if (isReadOnly) {
      setReadOnlyNotice('Action Blocked: Customer account has Read-Only access. Master Controller Admin privileges required to add or scrape leads.');
      setTimeout(() => setReadOnlyNotice(null), 4500);
      return;
    }

    let sanitizedLeads: RCMLead[] = [];
    setLeads((prev) => {
      const existingIds = new Set(prev.map(l => l.id));
      sanitizedLeads = newLeads.map((nl, idx) => {
        let uniqueId = nl.id;
        if (!uniqueId || existingIds.has(uniqueId)) {
          uniqueId = `lead-scraped-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
        }
        existingIds.add(uniqueId);
        // Phases 1–3: stamp createdAt going forward (never backfilled) so
        // the Dashboard's leads-over-time series uses real record dates.
        return { ...nl, id: uniqueId, createdAt: (nl as any).createdAt || new Date().toISOString() };
      });
      return deduplicateLeads([...sanitizedLeads, ...prev]);
    });

    setStats((prev) => ({
      ...prev,
      leadsScraped: prev.leadsScraped + newLeads.length
    }));

    // Persist leads to Firestore if signed in
    if (firebaseUser) {
      try {
        for (const lead of sanitizedLeads) {
          const leadDocRef = doc(db, 'leads', lead.id);
          await setDoc(leadDocRef, {
            ...lead,
            userId: firebaseUser.uid,
            workspaceId: activeWorkspaceId,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (e) {
        console.warn('Failed to sync leads to Firestore:', e);
      }
    }
  };

  const handleUpdateLeadTags = async (leadId: string, tags: string[]) => {
    if (isReadOnly) {
      setReadOnlyNotice('Action Blocked: Customer account has Read-Only access. Tag modifications require Master Controller Admin permissions.');
      setTimeout(() => setReadOnlyNotice(null), 4500);
      return;
    }

    setLeads((prev) => 
      prev.map(l => l.id === leadId ? { ...l, tags } : l)
    );

    // Sync to Firestore if signed in
    if (firebaseUser) {
      try {
        const leadDocRef = doc(db, 'leads', leadId);
        await setDoc(leadDocRef, {
          tags,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Failed to sync updated lead tags to Firestore:', e);
      }
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: RCMLead['status']) => {
    if (isReadOnly) {
      setReadOnlyNotice('Action Blocked: Customer account has Read-Only access. Lead status transitions require Master Controller Admin permissions.');
      setTimeout(() => setReadOnlyNotice(null), 4500);
      return;
    }
    setLeads((prev) => 
      prev.map(l => l.id === leadId ? { 
        ...l, 
        status: newStatus,
        lastContacted: newStatus !== 'Ready for Call' ? 'Today' : l.lastContacted 
      } : l)
    );

    // Sync to Firestore if signed in
    if (firebaseUser) {
      try {
        const leadDocRef = doc(db, 'leads', leadId);
        await setDoc(leadDocRef, {
          status: newStatus,
          lastContacted: newStatus !== 'Ready for Call' ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Failed to sync updated lead status to Firestore:', e);
      }
    }
  };

  const handleUpdateLeadAuditNotes = async (leadId: string, auditNotes: string) => {
    setLeads((prev) => 
      prev.map(l => l.id === leadId ? { ...l, auditNotes } : l)
    );

    // Sync to Firestore if signed in
    if (firebaseUser) {
      try {
        const leadDocRef = doc(db, 'leads', leadId);
        await setDoc(leadDocRef, {
          auditNotes,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn('Failed to sync updated lead audit notes to Firestore:', e);
      }
    }
  };

  // Always-On Voice Command Action Triggers
  const handleVoiceScheduleFollowUp = (targetName: string, rawText: string) => {
    const lower = targetName.toLowerCase();
    const matchedLead = leads.find(l => 
      l.doctorName.toLowerCase().includes(lower) || 
      l.practiceName.toLowerCase().includes(lower)
    ) || leads.find(l => l.doctorName.toLowerCase().includes('marcus vance')) || leads[0];

    const doctorTitle = matchedLead ? matchedLead.doctorName : (targetName.startsWith('Dr.') ? targetName : `Dr. ${targetName}`);
    const practice = matchedLead ? matchedLead.practiceName : `${targetName} Specialty Clinic`;

    const newTask: ActionItem = {
      id: `task-voice-${Date.now()}`,
      task: `Scheduled Follow-Up: ${doctorTitle} (${practice}) - Review 50-Claim Fee Schedule & Denial Overturn`,
      due: 'Tomorrow, 10:00 AM PST',
      priority: 'Urgent',
      category: 'Phone Call',
      completed: false,
      leadId: matchedLead?.id,
      practiceName: practice,
      doctorName: doctorTitle,
      phone: matchedLead?.phone || '+1 (512) 892-4100',
      isScheduledCall: true,
      scheduledDateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      notes: `Voice-scheduled follow up triggered by keyword "${rawText}". Cardiology claim denial and audit review.`
    };

    handleAddTask(newTask);

    if (matchedLead) {
      handleUpdateLeadStatus(matchedLead.id, 'Audit Scheduled');
    }

    setActiveTab('reminders');
  };

  const handleVoiceAddLeadToPipeline = (targetName: string, _rawText: string) => {
    const lower = targetName.toLowerCase();
    const matchedLead = leads.find(l => 
      l.doctorName.toLowerCase().includes(lower) || 
      l.practiceName.toLowerCase().includes(lower)
    ) || activeCallLead || leads[0];

    if (matchedLead) {
      handleUpdateLeadStatus(matchedLead.id, 'Audit Scheduled');
      handleUpdateLeadTags(matchedLead.id, ['Target', 'VIP Practice', 'In Pipeline']);
    }

    setStats((prev) => {
      const currentVal = parseInt(prev.pipelineAdded.replace(/[^0-9]/g, ''), 10) || 145000;
      const newVal = currentVal + 65000;
      return {
        ...prev,
        auditsBooked: prev.auditsBooked + 1,
        pipelineAdded: `$${newVal.toLocaleString()} / mo`,
        denialAuditValue: '$680,000'
      };
    });

    setActiveTab('pipeline');
  };

  const handleVoiceCallLead = (targetName: string) => {
    const lower = targetName.toLowerCase();
    const matchedLead = leads.find(l => 
      l.doctorName.toLowerCase().includes(lower) || 
      l.practiceName.toLowerCase().includes(lower)
    ) || leads.find(l => l.doctorName.toLowerCase().includes('marcus vance')) || leads[0];

    if (matchedLead) {
      setActiveCallLead(matchedLead);
    }
    setActiveTab('call_studio');
  };

  const handleVoiceScrapeLeadsTrigger = () => {
    const newScraped: RCMLead[] = [
      {
        id: `lead-voice-${Date.now()}-1`,
        practiceName: 'Baylor St. Luke Cardiology & Electrophysiology',
        doctorName: 'Dr. Marcus Vance, MD, FACC',
        title: 'Managing Partner & Interventional Cardiologist',
        specialty: 'Cardiovascular Disease',
        practiceSize: '7 Physicians, 3 PAs',
        phone: '(512) 892-4100',
        email: 'mvance@baylorcardio.org',
        address: '6624 Fannin St, Houston, TX 77030',
        state: 'TX',
        ehrSystem: 'eClinicalWorks v12',
        monthlyClaimVolume: '$540,000 / mo',
        painPoints: ['Prior Auth Overdue', 'Denials on Complex Modifiers', 'Staffing Turnover'],
        tags: ['Target', 'VIP Practice', 'In Pipeline'],
        source: 'Voice Radar Trigger',
        status: 'Audit Scheduled'
      }
    ];
    handleAddScrapedLeads(newScraped);
    setActiveTab('leads');
  };

  const handleExportCSV = () => {
    const headers = ['Practice Name', 'Doctor Name', 'Title', 'Specialty', 'Phone', 'Email', 'Monthly Claim Volume', 'EHR System', 'Status'];
    const rows = leads.map(l => [
      `"${(l.practiceName || '').replace(/"/g, '""')}"`,
      `"${(l.doctorName || '').replace(/"/g, '""')}"`,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      `"${(l.specialty || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.monthlyClaimVolume || ''}"`,
      `"${l.ehrSystem || ''}"`,
      `"${l.status || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pulsar_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Ensure page always starts at the top hero section on load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  // Always-On Voice Command Hook Initialization
  const voiceListener = useVoiceCommandListener({
    onScheduleFollowUp: handleVoiceScheduleFollowUp,
    onAddLeadToPipeline: handleVoiceAddLeadToPipeline,
    onCallLead: handleVoiceCallLead,
    onNavigateTab: (tab) => setActiveTab(tab),
    onToggleTheme: toggleTheme,
    onOpenModal: (modal) => {
      if (modal === 'chatbot') setIsChatbotOpen(true);
      else if (modal === 'transcriber') setIsTranscriberOpen(true);
      else if (modal === 'grounding') setIsGroundingOpen(true);
      else if (modal === 'settings') setIsSettingsOpen(true);
      else if (modal === 'display') setIsDisplaySettingsOpen(true);
      else if (modal === 'install') setIsInstallModalOpen(true);
    },
    onScrapeLeadsTrigger: handleVoiceScrapeLeadsTrigger
  });

  const unreadTasksCount = tasks.filter(t => !t.completed).length;

  return (
    <AuthGate>
      <div className={`relative min-h-screen flex flex-col font-sans selection:bg-teal-500 selection:text-white overflow-x-hidden transition-all duration-300 ${
      isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
    } bg-[var(--app-bg)] text-[var(--text-primary)] ${
      isDark ? 'quantum-bg-dark' : 'quantum-bg-light'
    }`}>
      
      {/* ZoeyOS-inspired Living World 3D Neural Orbs & Constellations */}
      <FuturisticOrbWorld />

      {/* Spatial Sidebar (Fixed Left Navigation Shell) */}
      <SpatialSidebar
        activeModule={activeModule}
        onSelectModule={(mod) => {
          if (mod === 'settings') {
            setIsSettingsOpen(true);
          } else if (mod === 'workspaces') {
            setIsNicheLibraryOpen(true);
          } else if (mod === 'permissions') {
            openAuthModal('signin');
          } else if (mod === 'ai_assistant') {
            setIsCopilotOpen(true);
          } else if (mod === 'activity_feed') {
            setActiveModule('command_center');
          } else {
            setActiveModule(mod);
          }
        }}
        leadsCount={leads.length}
        unreadTasksCount={unreadTasksCount}
        meetingNotesCount={meetingNotes.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => {
          const next = !isSidebarCollapsed;
          setIsSidebarCollapsed(next);
          localStorage.setItem('pulsar_sidebar_collapsed', String(next));
        }}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        access={access}
        onLockedSelect={(featureKey, label) => setUpgradeNotice({ featureKey, label })}
      />

      {/* Plan upgrade notice (locked-not-hidden, §3e) */}
      {upgradeNotice && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm sticky top-0 z-50 shadow-sm flex items-center justify-center gap-3">
          <span>
            <strong>{upgradeNotice.label}</strong> isn't included in your current plan
            {access?.plan ? ` (${access.plan.name})` : ''}. Upgrade your plan to unlock it.
          </span>
          <button
            onClick={() => setUpgradeNotice(null)}
            className="px-2 py-0.5 rounded-md border border-amber-300 font-semibold hover:bg-amber-100 transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Google Maps Platform Quota Defense Banner (Case A) */}
      {isMapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-center gap-2">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Spatial Top Command Bar */}
      <SpatialCommandBar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        activeNicheName={activeNicheTemplate.name}
        onOpenNicheLibrary={() => setIsNicheLibraryOpen(true)}
        unreadTasksCount={unreadTasksCount}
        tasks={tasks}
        onOpenTasks={() => setActiveModule('reminders')}
        onOpenCallStudio={() => {
          if (!activeCallLead && leads.length > 0) {
            setActiveCallLead(leads[0]);
          }
          setActiveModule('call_studio');
        }}
        onOpenNewLeadModal={() => setActiveModule('leads')}
        onOpenAI={() => setIsCopilotOpen(true)}
        onExportCSV={handleExportCSV}
        settings={settings}
        activeAgentsCount={5}
      />

      {/* Role & Access Mode Status Banner - Liquid Glass */}
      <div className={`w-full py-2 px-3 sm:px-4 border-b flex flex-wrap items-center justify-between gap-2 text-xs z-20 backdrop-blur-md transition-colors duration-200 ${
        isReadOnly 
          ? isDark ? 'bg-sky-950/60 border-sky-800/40 text-sky-200' : 'bg-sky-50 border-sky-200 text-sky-950'
          : isDark ? 'bg-amber-950/40 border-amber-800/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
      }`}>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {isReadOnly ? (
            <>
              <span className={`px-2 py-0.5 rounded-full font-bold shrink-0 flex items-center gap-1 font-mono text-[10px] border shadow-sm ${
                isDark ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-sky-100 text-sky-900 border-sky-300'
              }`}>
                <Lock className="w-3 h-3" /> CUSTOMER READ-ONLY
              </span>
              <span className="text-slate-600 dark:text-slate-300 text-xs hidden sm:inline truncate max-w-sm">
                Tenant: <strong className="font-mono text-sky-700 dark:text-sky-300">{activeWorkspaceId}</strong> (Isolated DB).
              </span>
            </>
          ) : (
            <>
              <span className={`px-2 py-0.5 rounded-full font-bold shrink-0 flex items-center gap-1 font-mono text-[10px] border shadow-sm ${
                isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                <Crown className="w-3 h-3" /> MASTER CONTROLLER
              </span>
              <span className="text-slate-600 dark:text-slate-300 text-xs hidden sm:inline truncate max-w-sm">
                Tenant: <strong className="font-mono text-amber-700 dark:text-amber-300">{activeWorkspaceId}</strong> (Unrestricted).
              </span>
            </>
          )}

          {/* Active Niche Badge with Quick-Open */}
          <button
            onClick={() => setIsNicheLibraryOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition cursor-pointer border ${
              isDark 
                ? 'bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border-violet-500/40' 
                : 'bg-purple-100/90 hover:bg-purple-200/90 text-purple-900 border-purple-300'
            }`}
            title="Click to open Business Niche Library"
          >
            <Sparkles className="w-2.5 h-2.5 text-violet-500 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-none">Niche: {activeNicheTemplate.name.split('&')[0].trim()}</span>
            <span className="underline ml-0.5 text-violet-600 dark:text-violet-400">Change</span>
          </button>
        </div>

        {/* Right Quick Controls on Tablet & Desktop */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2.5 py-1 rounded-xl font-mono text-[11px] font-bold border border-slate-700/60 bg-slate-800/40 text-slate-300">
            {isMasterAdmin ? 'Master Admin' : 'Customer (Read-Only)'}
          </span>
        </div>
      </div>

      {/* Main Container - Responsive & Adjustable to screen size */}
      <div className={`relative z-10 flex-1 transition-all duration-300 ${containerClass} ${spacingClass} pb-24 md:pb-8 pt-4`}>
        
        {/* ZoeyOS-Inspired Pulsar Autonomous Core & Dynamic Moving Object */}
        <ZoeyPulsarCore
          onDialTrigger={() => {
            if (!activeCallLead && leads.length > 0) {
              setActiveCallLead(leads[0]);
            }
            setActiveModule('call_studio');
          }}
          onOpenBriefing={() => setActiveModule('briefing')}
          onOpenNicheLibrary={() => setIsNicheLibraryOpen(true)}
          nicheTemplate={activeNicheTemplate}
          stats={stats}
        />

        {/* Navigation Tabs - Desktop, Tablet, and Mobile Responsive Dock */}
        <NavigationDock
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            if (tabId === 'call_studio' && !activeCallLead && leads.length > 0) {
              setActiveCallLead(leads[0]);
            }
            setActiveModule(tabId as PulsarSpatialModule);
          }}
          leadsCount={leads.length}
          meetingNotesCount={meetingNotes.length}
          unreadTasksCount={unreadTasksCount}
          onOpenMobileDrawer={() => setIsMobileSidebarOpen(true)}
          className="my-3 sm:my-4"
        />

        {/* Dynamic Spatial Module Views */}
        {activeModule === 'command_center' && (
          useClassicDashboard ? (
            <Dashboard
              stats={stats}
              leads={leads}
              warmTransfers={warmTransfers}
              tasks={tasks}
              nicheTemplate={activeNicheTemplate}
              onNavigate={(mod) => {
                if (mod === 'settings') setIsSettingsOpen(true);
                else if (mod === 'workspaces') setIsNicheLibraryOpen(true);
                else setActiveModule(mod);
              }}
              onTriggerCall={(lead) => {
                setActiveCallLead(lead);
                setActiveModule('call_studio');
              }}
              onToggleTask={handleToggleTask}
              onOpenAI={() => setIsCopilotOpen(true)}
              onOpenNicheLibrary={() => setIsNicheLibraryOpen(true)}
              settings={settings}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          ) : (
            <LiquidGlassDashboard
              stats={stats}
              leads={leads}
              warmTransfers={warmTransfers}
              tasks={tasks}
              nicheTemplate={activeNicheTemplate}
              onNavigate={(mod) => {
                if (mod === 'settings') setIsSettingsOpen(true);
                else if (mod === 'workspaces') setIsNicheLibraryOpen(true);
                else setActiveModule(mod);
              }}
              onTriggerCall={(lead) => {
                setActiveCallLead(lead);
                setActiveModule('call_studio');
              }}
              onToggleTask={handleToggleTask}
              onOpenAI={() => setIsCopilotOpen(true)}
              onOpenNicheLibrary={() => setIsNicheLibraryOpen(true)}
              settings={settings}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onToggleClassicDashboard={() => setUseClassicDashboard(!useClassicDashboard)}
            />
          )
        )}

        {(activeModule === 'campaigns' || activeModule === 'email_outreach') && (
          <CampaignManagementWorkspace
            leads={leads}
            onTriggerCall={(lead) => {
              setActiveCallLead(lead);
              setActiveModule('call_studio');
            }}
          />
        )}

        {(activeModule === 'ai_agents' || activeModule === 'workflows' || activeModule === 'agent_performance') && (
          <AIAgentFleetWorkspace />
        )}

        {activeModule === 'integrations' && (
          <IntegrationsAdminWorkspace
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* Phases 1–3: Admin Access Control Center (master admins only;
            the server enforces the same gate on /api/admin/*) */}
        {activeModule === 'admin_access' && access?.isMasterAdmin && (
          <AdminAccessControlCenter />
        )}

        {/* Phases 4–6: Pipeline Ops (lead registry, notes & tasks, email
            sequences). Server routes enforce auth + plan gates. */}
        {activeModule === 'pipeline_ops' && (
          <PipelineWorkspace />
        )}

        {/* Dynamic Tab Views */}
        {(activeModule === 'leads' || activeModule === 'prospects' || activeModule === 'qualification') && (
          <div className="space-y-6">
            <SkiperRadarScanner
              leads={leads}
              onTriggerScrape={({ specialty, location, count }) => {
                const generatedLeads: RCMLead[] = Array.from({ length: count }, (_, i) => ({
                  id: `lead-radar-${Date.now()}-${i}`,
                  practiceName: `${location.split(',')[0]} ${specialty} Clinic ${i + 1}`,
                  doctorName: `Dr. Alex Vance, MD (${specialty.split(' ')[0]})`,
                  title: 'Managing Partner & Clinical Director',
                  specialty: specialty,
                  practiceSize: '5-15 Providers',
                  phone: `(${Math.floor(100 + Math.random() * 900)}) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
                  email: `dr.vance${i + 1}@clinicalpractice.org`,
                  address: `${100 + i * 20} Medical Plaza Parkway`,
                  state: location.includes('TX') ? 'TX' : location.includes('WA') ? 'WA' : 'GA',
                  ehrSystem: i % 2 === 0 ? 'eClinicalWorks v12' : 'Epic Systems',
                  monthlyClaimVolume: '$180,000 / mo',
                  painPoints: ['Prior Auth Overdue', 'Denials on Complex Modifiers', 'Staffing Turnover'],
                  source: 'Skiper UI Autonomous Bot Scraper',
                  status: 'Ready for Call'
                }));
                handleAddScrapedLeads(generatedLeads);
              }}
              onSendToCallQueue={(lead) => {
                setActiveCallLead(lead);
                setActiveTab('call_studio');
              }}
            />

            <LeadScraper
              leads={leads}
              meetingNotes={meetingNotes}
              onSelectLeadForCall={(lead) => {
                setActiveCallLead(lead);
                setActiveTab('call_studio');
              }}
              onAddLeads={handleAddScrapedLeads}
              onUpdateLeadTags={handleUpdateLeadTags}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onUpdateLeadAuditNotes={handleUpdateLeadAuditNotes}
            />
          </div>
        )}

        {activeTab === 'network' && (
          <NetworkBuilderMatrix
            onDialLead={(lead) => {
              setActiveCallLead(lead);
              setActiveTab('call_studio');
            }}
            onSendLinkedIn={() => {
              setActiveTab('linkedin');
            }}
          />
        )}

        {activeTab === 'linkedin' && (
          <LinkedInFinder
            onDialProspect={(lead) => {
              setActiveCallLead(lead);
              setActiveTab('call_studio');
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'pipeline' && (
          <SalesBDVelocityHub
            stats={stats}
            leads={leads}
            nicheTemplate={activeNicheTemplate}
            onTriggerCall={(lead) => {
              setActiveCallLead(lead);
              setActiveTab('call_studio');
            }}
            onOpenBriefing={() => setActiveTab('briefing')}
          />
        )}

        {activeTab === 'call_studio' && (
          <div className="space-y-4">
            {/* Quick Practice Selector */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs backdrop-blur-xl transition-colors duration-300 ${
              isDark 
                ? 'bg-slate-900/70 border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.3)]' 
                : 'bg-white/85 border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.06)]'
            }`}>
              <div className="flex items-center gap-2">
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Target Provider for AI Calling:</span>
                <select
                  value={activeCallLead?.id || leads[0]?.id}
                  onChange={(e) => {
                    const found = leads.find(l => l.id === e.target.value);
                    if (found) setActiveCallLead(found);
                  }}
                  className={`border rounded-xl px-3 py-1.5 font-semibold focus:outline-none focus:border-teal-500 cursor-pointer transition ${
                    isDark 
                      ? 'bg-slate-950 border-slate-700 text-white' 
                      : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                  }`}
                >
                  {deduplicateLeads(leads).map(l => (
                    <option key={l.id} value={l.id}>
                      {l.practiceName} — {l.doctorName} ({l.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className={`font-mono flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#10b981]" />
                <span>Warm Transfer Destination: <strong className="text-emerald-500 dark:text-emerald-300">{settings.managerPhone}</strong></span>
              </div>
            </div>

            {(activeCallLead || leads[0]) && (
              <CallStudio
                lead={activeCallLead || leads[0]}
                settings={settings}
                nicheTemplate={activeNicheTemplate}
                onCallEnded={handleCallEnded}
                onScheduleFollowUpCall={handleAddTask}
                onClose={() => setActiveTab('meeting_notes')}
              />
            )}
          </div>
        )}

        {activeTab === 'meeting_notes' && (
          <MeetingNotesView
            notes={meetingNotes}
            onToggleTask={handleToggleTask}
            onSelectLeadForCall={(leadId) => {
              const lead = leads.find(l => l.id === leadId);
              if (lead) {
                setActiveCallLead(lead);
                setActiveTab('call_studio');
              }
            }}
          />
        )}

        {(activeTab === 'google_tasks' || activeModule === 'google_tasks') && (
          <GoogleTasksWorkspace
            localTasks={tasks}
            onImportToLocal={(imported) => {
              imported.forEach(t => handleAddTask(t));
            }}
            onDialCall={(phone, doctorName, practiceName) => {
              setActiveCallLead({
                id: `lead-${Date.now()}`,
                practiceName: practiceName || 'Target Medical Practice',
                doctorName: doctorName || 'Doctor / Decision Maker',
                title: 'Managing Physician',
                specialty: activeNicheTemplate.name,
                practiceSize: 'Multi-Physician Practice',
                phone: phone,
                email: 'office@practice.com',
                address: 'United States',
                state: 'US',
                ehrSystem: 'AthenaHealth / Epic / eCW',
                monthlyClaimVolume: '$400,000 / mo',
                painPoints: ['Follow-up action item from Google Tasks'],
                source: 'Google Tasks Sync',
                status: 'Ready for Call'
              });
              setActiveTab('call_studio');
              setActiveModule('call_studio');
            }}
          />
        )}

        {(activeTab === 'google_forms' || activeModule === 'google_forms') && (
          <GoogleFormsWorkspace
            leads={leads}
            nicheTemplate={activeNicheTemplate}
            onSelectLeadForForm={(lead) => {
              setActiveCallLead(lead);
              setActiveTab('call_studio');
              setActiveModule('call_studio');
            }}
          />
        )}

        {(activeTab === 'territory_maps' || activeModule === 'territory_maps') && (
          <GoogleMapsTerritoryWorkspace
            leads={leads}
            onSelectLeadForCall={(lead) => {
              setActiveCallLead(lead);
              setActiveTab('call_studio');
              setActiveModule('call_studio');
            }}
            onNavigateToTasks={() => {
              setActiveTab('google_tasks');
              setActiveModule('google_tasks');
            }}
          />
        )}

        {(activeTab === 'reminders' || activeModule === 'reminders') && activeModule !== 'google_tasks' && (
          <RemindersTracker
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onDialScheduledCall={(task) => {
              const found = leads.find(l => 
                (task.leadId && l.id === task.leadId) || 
                (task.practiceName && l.practiceName.toLowerCase().includes(task.practiceName.toLowerCase()))
              );
              if (found) {
                setActiveCallLead(found);
              } else {
                setActiveCallLead({
                  id: task.leadId || `lead-${Date.now()}`,
                  practiceName: task.practiceName || 'Target Medical Practice',
                  doctorName: task.doctorName || 'Doctor / Decision Maker',
                  title: 'Managing Physician',
                  specialty: 'Clinical Specialty Practice',
                  practiceSize: 'Multi-Physician Practice',
                  phone: task.phone || '+1 (555) 000-0000',
                  email: 'office@practice.com',
                  address: 'United States',
                  state: 'US',
                  ehrSystem: 'AthenaHealth / Epic / eCW',
                  monthlyClaimVolume: '$400,000 / mo',
                  painPoints: [task.notes || 'Scheduled follow-up regarding medical billing audit'],
                  source: 'Scheduled Call Queue',
                  status: 'Ready for Call'
                });
              }
              setActiveTab('call_studio');
            }}
          />
        )}

        {activeTab === 'briefing' && (
          <DailyBriefingView
            stats={stats}
            warmTransfers={warmTransfers}
            settings={settings}
            meetingNotes={meetingNotes}
            leads={leads}
          />
        )}

      </div>

      {/* Settings Modal */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        onOpenNicheLibrary={() => setIsNicheLibraryOpen(true)}
      />

      {/* Gemini Multi-Turn Chatbot Modal */}
      <AIChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />

      {/* Audio Transcriber Modal (gemini-3.5-transcribe) */}
      <AudioTranscriberModal
        isOpen={isTranscriberOpen}
        onClose={() => setIsTranscriberOpen(false)}
        onApplyTranscription={(text) => {
          // If in CallStudio with active note or add as task
          handleAddTask({
            id: `transcription-task-${Date.now()}`,
            task: `Audio Dictation Transcript: "${text.slice(0, 100)}..."`,
            due: 'Today',
            priority: 'Medium',
            category: 'Audit Proposal',
            completed: false,
            notes: text
          });
        }}
      />

      {/* Google Maps & Search Grounding Intelligence Modal */}
      <GroundingIntelligenceModal
        isOpen={isGroundingOpen}
        onClose={() => setIsGroundingOpen(false)}
        onAddLead={(newLead) => {
          handleAddScrapedLeads([newLead]);
        }}
      />

      {/* PWA Phone Installation Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Screen Margins & Display Settings Modal */}
      <DisplaySettingsModal
        isOpen={isDisplaySettingsOpen}
        onClose={() => setIsDisplaySettingsOpen(false)}
      />

      {/* Floating Bottom-Right Quick Viewport & Margins Bar */}
      <div className={`fixed bottom-4 right-4 z-40 flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-xl backdrop-blur-2xl transition-all duration-300 select-none ${
        isDark 
          ? 'bg-[#111C2E]/90 border-slate-700/40 text-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.6)]' 
          : 'bg-white/95 border-[#DCE5EC] text-slate-800 shadow-[0_8px_30px_rgba(23,35,56,0.1)]'
      }`}>
        <button
          onClick={() => {
            const nextMode = widthMode === 'fluid' ? 'wide' : widthMode === 'wide' ? 'default' : widthMode === 'default' ? 'compact' : 'fluid';
            setWidthMode(nextMode);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
            isDark ? 'hover:bg-slate-800 text-emerald-400' : 'hover:bg-slate-100 text-emerald-700'
          }`}
          title={`Click to cycle screen width: Fluid (100%) -> Wide (1600px) -> Standard (1280px) -> Compact (Current: ${widthMode})`}
        >
          <span className="text-[10px] uppercase">{widthMode}</span>
        </button>

        <div className={`w-px h-4 ${isDark ? 'bg-white/10' : 'bg-slate-300'}`} />

        {/* 1-Click Quick Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-1.5 rounded-xl transition cursor-pointer ${
            isDark ? 'hover:bg-slate-800 text-emerald-400' : 'hover:bg-slate-100 text-blue-600'
          }`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4 text-emerald-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
        </button>

        <div className={`w-px h-4 ${isDark ? 'bg-white/10' : 'bg-slate-300'}`} />

        <button
          onClick={() => setIsDisplaySettingsOpen(true)}
          className={`p-1.5 rounded-xl transition cursor-pointer ${
            isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-950'
          }`}
          title="Open interactive screen margins, box sizes, and display density settings"
        >
          <Sliders className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        </button>
      </div>

      {/* Always-On & Need-Based Voice Command Assistant HUD */}
      <AlwaysOnVoiceListener
        voiceMode={voiceListener.voiceMode}
        onSetVoiceMode={voiceListener.setVoiceMode}
        isAlwaysOn={voiceListener.isAlwaysOn}
        isListening={voiceListener.isListening}
        isSupported={voiceListener.isSupported}
        hasPermission={voiceListener.hasPermission}
        transcript={voiceListener.transcript}
        interimTranscript={voiceListener.interimTranscript}
        audioLevel={voiceListener.audioLevel}
        autoOffSecondsRemaining={voiceListener.autoOffSecondsRemaining}
        voiceFeedbackEnabled={voiceListener.voiceFeedbackEnabled}
        onToggleVoiceFeedback={voiceListener.setVoiceFeedbackEnabled}
        lastActionMessage={voiceListener.lastActionMessage}
        commandHistory={voiceListener.commandHistory}
        onToggleAlwaysOn={() => voiceListener.toggleAlwaysOn()}
        onToggleListening={() => voiceListener.toggleListening()}
        onTriggerCommand={voiceListener.triggerVoiceCommand}
      />

      {/* Read-Only Notice Toast */}
      {readOnlyNotice && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-sky-500/50 shadow-2xl text-white text-xs flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 max-w-md">
          <Lock className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="flex-1">{readOnlyNotice}</span>
          <button onClick={() => setReadOnlyNotice(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Authentication & Profile Modal */}
      <AuthModal />

      {/* Codebase & Architecture Inspector Modal */}
      <CodebaseViewerModal
        isOpen={isCodebaseOpen}
        onClose={() => setIsCodebaseOpen(false)}
      />

      {/* Business Niche Library Modal */}
      <BusinessNicheLibraryModal
        isOpen={isNicheLibraryOpen}
        onClose={() => setIsNicheLibraryOpen(false)}
        activeNicheId={activeNicheTemplate.id}
        onSelectTemplate={handleSelectNicheTemplate}
        isReadOnly={isReadOnly}
      />

      {/* Spatial Command Palette (Cmd+K / Ctrl+K) */}
      <SpatialCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        leads={leads}
        onSelectLead={(lead) => {
          setActiveCallLead(lead);
          setActiveModule('call_studio');
        }}
        onNavigate={(mod) => {
          if (mod === 'settings') setIsSettingsOpen(true);
          else if (mod === 'workspaces') setIsNicheLibraryOpen(true);
          else setActiveModule(mod);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNicheLibrary={() => setIsNicheLibraryOpen(true)}
        onOpenAI={() => setIsCopilotOpen(true)}
        onToggleVoice={() => voiceListener.toggleListening()}
        onExportCSV={handleExportCSV}
      />

      {/* Spatial Persistent AI Copilot Floating Panel */}
      <SpatialAICopilotPanel
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activeLead={activeCallLead}
      />

    </div>
    </AuthGate>
  );
}

