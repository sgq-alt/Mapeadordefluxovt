import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, deleteDoc, collection, onSnapshot, serverTimestamp, Firestore } from 'firebase/firestore';

// ==========================================
// CONFIGURAÇÃO OFICIAL DO FIREBASE (EMBEDDED)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAkIqiBT1r4Qe8PqB3PJAAu8OPkaenO_9k",
  authDomain: "databasemapeador.firebaseapp.com",
  projectId: "databasemapeador",
  storageBucket: "databasemapeador.firebasestorage.app",
  messagingSenderId: "504933612170",
  appId: "1:504933612170:web:54370517af772367a94b73",
  measurementId: "G-WFCN9M61HY"
};

// Inicialização segura fora do componente principal
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const appId = 'vickytex-process-mapper'; // ID único da aplicação

// Interfaces TypeScript para garantir tipagem estrita contra bugs de compilação
interface IconProps {
  className?: string;
}

interface Sector {
  name: string;
  processes: string[];
  secondaryProcesses: string[];
  observations: string[];
}

interface Flowchart {
  id: string;
  title: string;
  content: string;
  updatedAt?: any;
}

// ==========================================
// COMPONENTES DE ÍCONES SVG NATIVOS (TIPADOS)
// ==========================================
const GitMergeIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 15V9a4 4 0 0 0-4-4H9" />
    <line x1="6" y1="9" x2="6" y2="15" />
  </svg>
);

const SitemapIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="8.5" y="16" width="7" height="5" rx="1" />
    <path d="M6.5 8v3a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V8" />
    <line x1="12" y1="13" x2="12" y2="16" />
  </svg>
);

const LayersIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const AlertTriangleIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const FileTextIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const CloudIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-.01a5 5 0 0 0-9.14-2.29C8.36 7.29 7.7 7 7 7a5 5 0 0 0-4.99 5A4.5 4.5 0 0 0 6.5 16.5H18a4.5 4.5 0 0 0 0-9z" />
  </svg>
);

const TrashIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const Edit3Icon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const HelpCircleIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const PlusIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ArrowRightIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ArrowDownIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

const RefreshCwIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const TruckIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const PackageIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
    <polygon points="12 22.08 21 17.08 21 6.92 12 12 12 22.08" />
    <polygon points="12 12 21 6.92 12 1.84 3 6.92 12 12" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const CheckSquareIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const EyeOffIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ==========================================
// FLUXO DE INICIALIZAÇÃO FALLBACK (MODO LOCAL)
// ==========================================
const defaultLocalContent = `*Recebimento
- Descarga do caminhão -> Conferência física de lotes
-- Montagem de palets e movimentação de estoque

* Contagem e conferência
- Separar por tamanhos -> Conferir com Romaneio -> Mandar para área de embalagem
-- Contar peças (manual ou por peso eletrônico)
= processo muito demorado e diversas vezes interrompido; ideal ser mais automatizado; ponto de retrabalho, principalmente por má organização do envio das facções e do recebimento

*Embalagem
- Preparar peças/kits -> dobrar -> embalar -> encaixotar
-- Separar peças encontradas com defeito para conserto ou lavação
= peças encontradas com defeito na fase de embalagem deveriam ser mapeadas para pontuar para a facção e no futuro gerar indicador

*Expedição
- Sequenciar saídas -> Lançamento de notas -> Emissão de Etiquetas -> Carregamento de frete
-- Programação e sincronização de transporte / transportadora externa
= A programação do transporte não é feita no mesmo local de expedição, gerando falta de sincronismo entre preparação de pedidos e saída dos mesmos. obs 1: supermercado de lotes para expedição com local determinado`;

export default function App() {
  const [inputText, setInputText] = useState<string>(defaultLocalContent);
  const [parsedData, setParsedData] = useState<Sector[]>([]);
  const [activeTab, setActiveTab] = useState<string>('tree-flow'); 
  const [showEditor, setShowEditor] = useState<boolean>(true);

  // Estados Gerenciamento de Fluxos
  const [flowchartTitle, setFlowchartTitle] = useState<string>('Fluxo Vickytex Principal');
  const [flowchartsList, setFlowchartsList] = useState<Flowchart[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string>('vickytex-main');

  // Estados de Autenticação e Sincronização do Firebase
  const [user, setUser] = useState<User | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<string>('disconnected'); // 'disconnected' | 'connecting' | 'connected' | 'error'
  const [syncStatus, setSyncStatus] = useState<string>('saved'); // 'saved' | 'saving' | 'error'

  // 1. PRIMEIRA ETAPA DO CONTRATO: Autenticação Anônima do Firebase
  useEffect(() => {
    setFirebaseStatus('connecting');
    const initFirebase = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Erro na autenticação anônima do Firebase:", err);
        setFirebaseStatus('error');
      }
    };

    initFirebase();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setFirebaseStatus('connected');
      } else {
        setUser(null);
        setFirebaseStatus('disconnected');
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. SEGUNDA ETAPA: Escuta ativa em Tempo Real (Sincronismo Direto)
  useEffect(() => {
    if (!user) {
      // Se não autenticado no Firebase, carrega do localStorage para garantir o salvamento local offline
      const savedConfigList = localStorage.getItem('vickytex_local_flows');
      if (savedConfigList) {
        const flows = JSON.parse(savedConfigList || '[]');
        setFlowchartsList(flows);
        const currentActive = flows.find((f: Flowchart) => f.id === activeFlowId);
        if (currentActive) {
          setInputText(currentActive.content);
          setFlowchartTitle(currentActive.title);
        }
      } else {
        const initialOffline = [{ id: 'vickytex-main', title: flowchartTitle, content: inputText }];
        localStorage.setItem('vickytex_local_flows', JSON.stringify(initialOffline));
        setFlowchartsList(initialOffline);
      }
      return;
    }

    setSyncStatus('saving');
    // Coleção estruturada rigorosamente no caminho exigido (RULE 1)
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'flowcharts');

    // OnSnapshot simples sem filtros complexos (RULE 2)
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const loadedFlows: Flowchart[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedFlows.push({
          id: docSnap.id,
          title: data.title || '',
          content: data.content || '',
          updatedAt: data.updatedAt
        });
      });

      setFlowchartsList(loadedFlows);

      // Se o banco estiver vazio pela primeira vez, inicializa com o fluxo padrão
      if (loadedFlows.length === 0) {
        saveFlowToCloud('vickytex-main', flowchartTitle, inputText);
      } else {
        const currentActive = loadedFlows.find(f => f.id === activeFlowId);
        if (currentActive) {
          setInputText(currentActive.content);
          setFlowchartTitle(currentActive.title);
        }
      }
      setSyncStatus('saved');
    }, (error) => {
      console.error("Erro no Listener do Cloud Firestore:", error);
      setSyncStatus('error');
    });

    return () => unsubscribe();
  }, [user, activeFlowId]);

  // 3. TERCEIRA ETAPA: Salvamento de fluxo na Nuvem ou Local
  const saveFlowToCloud = async (id: string, title: string, content: string) => {
    if (user) {
      setSyncStatus('saving');
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'flowcharts', id);
        await setDoc(docRef, {
          title: title,
          content: content,
          updatedAt: serverTimestamp()
        }, { merge: true });
        setSyncStatus('saved');
      } catch (error) {
        console.error("Erro ao escrever no Firestore:", error);
        setSyncStatus('error');
      }
    } else {
      // Fallback offline seguro para localStorage para blindar contra bugs
      const savedConfigList = localStorage.getItem('vickytex_local_flows');
      const offlineList: Flowchart[] = JSON.parse(savedConfigList || '[]');
      const updatedList = offlineList.map(f => f.id === id ? { ...f, title, content } : f);
      if (!updatedList.some(f => f.id === id)) {
        updatedList.push({ id, title, content });
      }
      localStorage.setItem('vickytex_local_flows', JSON.stringify(updatedList));
      setFlowchartsList(updatedList);
    }
  };

  // Sincronismo automático inteligente (Debounce de 1.2s para evitar overload no Firebase)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      saveFlowToCloud(activeFlowId, flowchartTitle, inputText);
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [inputText, flowchartTitle, activeFlowId]);

  // Criação de novos fluxogramas
  const handleCreateNewFlow = () => {
    const newId = `flow-${Date.now()}`;
    const newTitle = `Fluxograma ${flowchartsList.length + 1}`;
    const initialContent = `*Novo Setor\n- Nova Etapa Principal\n-- Nova Etapa de Apoio`;

    setActiveFlowId(newId);
    setFlowchartTitle(newTitle);
    setInputText(initialContent);

    saveFlowToCloud(newId, newTitle, initialContent);
  };

  // Exclusão de fluxograma
  const handleDeleteFlow = async (id: string) => {
    if (flowchartsList.length <= 1) return;

    if (user) {
      setSyncStatus('saving');
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'flowcharts', id);
        await deleteDoc(docRef);
        
        const remaining = flowchartsList.filter(f => f.id !== id);
        if (remaining.length > 0) {
          setActiveFlowId(remaining[0].id);
          setFlowchartTitle(remaining[0].title);
          setInputText(remaining[0].content);
        }
        setSyncStatus('saved');
      } catch (err) {
        console.error("Erro ao remover documento:", err);
        setSyncStatus('error');
      }
    } else {
      const remaining = flowchartsList.filter(f => f.id !== id);
      localStorage.setItem('vickytex_local_flows', JSON.stringify(remaining));
      setFlowchartsList(remaining);
      if (remaining.length > 0) {
        setActiveFlowId(remaining[0].id);
        setFlowchartTitle(remaining[0].title);
        setInputText(remaining[0].content);
      }
    }
  };

  // PARSER DE TEXTO: Mapeia em tempo real a árvore de dados do editor
  useEffect(() => {
    const lines = inputText.split('\n');
    const sectors: Sector[] = [];
    let currentSector: Sector | null = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('*')) {
        const name = trimmed.substring(1).trim();
        currentSector = {
          name: name,
          processes: [],           // Linha de Frente
          secondaryProcesses: [],  // Apoio
          observations: []
        };
        sectors.push(currentSector);
      } else if (trimmed.startsWith('--')) {
        const subSecText = trimmed.substring(2).trim();
        let cleanSecLine = subSecText;
        let inlineSecObs: string | null = null;

        if (subSecText.includes('=')) {
          const parts = subSecText.split('=');
          cleanSecLine = parts[0].trim();
          inlineSecObs = parts[1].trim();
        }

        const subSecProcesses = cleanSecLine
          .split('->')
          .map(p => p.trim())
          .filter(Boolean);

        if (currentSector) {
          currentSector.secondaryProcesses.push(...subSecProcesses);
          if (inlineSecObs) {
            currentSector.observations.push(`[Nota Secundária] ${inlineSecObs}`);
          }
        }
      } else if (trimmed.startsWith('-')) {
        const processLine = trimmed.substring(1).trim();
        let cleanProcessLine = processLine;
        let inlineObs: string | null = null;
        
        if (processLine.includes('=')) {
          const parts = processLine.split('=');
          cleanProcessLine = parts[0].trim();
          inlineObs = parts[1].trim();
        }

        const subProcesses = cleanProcessLine
          .split('->')
          .map(p => p.trim())
          .filter(Boolean);

        if (currentSector) {
          currentSector.processes.push(...subProcesses);
          if (inlineObs) {
            currentSector.observations.push(`[Nota de Processo] ${inlineObs}`);
          }
        }
      } else if (trimmed.startsWith('=')) {
        const obs = trimmed.substring(1).trim();
        if (currentSector) {
          currentSector.observations.push(obs);
        }
      }
    });

    setParsedData(sectors);
  }, [inputText]);

  // Helpers de Processamento do Layout original Vickytex
  const getSectorIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('recebi')) return <RefreshCwIcon className="w-5 h-5" />;
    if (lowerName.includes('conta') || lowerName.includes('conferi')) return <CheckSquareIcon className="w-5 h-5" />;
    if (lowerName.includes('embala')) return <PackageIcon className="w-5 h-5" />;
    if (lowerName.includes('expedi')) return <TruckIcon className="w-5 h-5" />;
    return <LayersIcon className="w-5 h-5" />;
  };

  const analyzeObservation = (obs: string) => {
    const lower = obs.toLowerCase();
    let type = 'info'; 
    let text = obs;

    if (lower.includes('demorado') || lower.includes('interrompido') || lower.includes('retrabalho') || lower.includes('falta de') || lower.includes('gargalo')) {
      type = 'gargalo';
    } else if (lower.includes('criar') || lower.includes('gerar indicador') || lower.includes('ideal') || lower.includes('deveriam ser') || lower.includes('mapeadas')) {
      type = 'oportunidade';
    }

    return { type, text };
  };

  const addSectorTemplate = (sectorType: string) => {
    let template = "";
    if (sectorType === 'producao') {
      template = `\n\n*Produção / Costura
- Receber lote de corte -> Costurar peças -> Conferir qualidade
-- Abastecer células de costura -> Separar peças com defeito de costura
= Alta variação de tempo conforme tipo de maquinário e experiência da facção`;
    } else if (sectorType === 'corte') {
      template = `\n\n*Corte
- Enfesto de tecidos -> Riscar moldes -> Cortar
-- Separar e amarrar por grades de tamanhos
= Alta variação no tempo de enfesto conforme tipo de malha de cada artigo`;
    }
    setInputText(prev => prev + template);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-[#0B2545] border-b-4 border-[#006335] px-6 py-4 flex flex-wrap items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-[#006335] text-[#FDFBF7] p-2.5 rounded-lg font-black tracking-widest text-lg shadow-md border border-[#006335]/30">
            VT
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#FDFBF7] flex items-center gap-2">
              VICKYTEX <span className="text-[#006335] bg-[#FDFBF7] text-[10px] font-bold px-2 py-0.5 rounded border border-[#006335]/20">Mapeador de Processos</span>
            </h1>
            <p className="text-xs text-slate-300">Layout de Engenharia de Métodos e Processos Industriais</p>
          </div>
        </div>

        {/* Status de Sincronização do Firebase */}
        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
          {firebaseStatus === 'connected' ? (
            <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Nuvem Ativa ({syncStatus === 'saving' ? 'Sincronizando...' : 'Salvo na Nuvem'})</span>
            </div>
          ) : firebaseStatus === 'connecting' ? (
            <div className="flex items-center space-x-2 bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold animate-pulse">
              <span>🔄</span>
              <span>Conectando ao Banco...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-rose-50 text-rose-800 border border-rose-300 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <span>⚠️</span>
              <span>Modo Local (Offline)</span>
            </div>
          )}
        </div>

        {/* Abas de Navegação e Controles */}
        <div className="flex items-center space-x-3 mt-2 lg:mt-0 flex-wrap gap-y-2">
          <button 
            onClick={() => setShowEditor(!showEditor)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
              showEditor 
                ? 'bg-[#006335] text-white hover:bg-[#004d29]' 
                : 'bg-[#F59E0B] text-slate-900 hover:bg-[#d97706]'
            }`}
          >
            <Edit3Icon className="w-3.5 h-3.5" />
            {showEditor ? 'Ocultar Editor' : 'Ativar Edição'}
          </button>

          <div className="flex bg-[#07162c] rounded-lg p-1 border border-slate-700/50">
            <button 
              onClick={() => setActiveTab('tree-flow')} 
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'tree-flow' ? 'bg-[#006335] text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              <SitemapIcon className="w-3.5 h-3.5" />
              Fluxograma Linear
            </button>
            <button 
              onClick={() => setActiveTab('visual-flow')} 
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'visual-flow' ? 'bg-[#006335] text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              <GitMergeIcon className="w-3.5 h-3.5" />
              Fluxograma Visual
            </button>
            <button 
              onClick={() => setActiveTab('swimlanes')} 
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'swimlanes' ? 'bg-[#006335] text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              <LayersIcon className="w-3.5 h-3.5" />
              Cadeia de Valor
            </button>
            <button 
              onClick={() => setActiveTab('diagnostics')} 
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'diagnostics' ? 'bg-[#006335] text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              <AlertTriangleIcon className="w-3.5 h-3.5" />
              Gargalos &amp; Planos
            </button>
            <button 
              onClick={() => setActiveTab('guide')} 
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'guide' ? 'bg-[#006335] text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              <HelpCircleIcon className="w-3.5 h-3.5" />
              Sintaxe
            </button>
          </div>
        </div>
      </header>

      {/* Corpo Principal */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Painel do Editor */}
        {showEditor && (
          <div className="w-full lg:w-4/12 bg-[#F4EFE6] border-r border-[#E5DEC9] flex flex-col p-4 space-y-4 transition-all duration-300">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0B2545] uppercase tracking-wider block">Nome do Fluxo Atual:</label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={flowchartTitle} 
                  onChange={(e) => setFlowchartTitle(e.target.value)} 
                  className="flex-1 bg-white border border-[#D5CBB3] rounded-lg px-3 py-2 text-xs font-bold text-[#0B2545] shadow-inner focus:outline-none focus:ring-1 focus:ring-[#006335]"
                />
                <button 
                  onClick={handleCreateNewFlow} 
                  className="bg-[#006335] hover:bg-[#004d29] text-white px-3 rounded-lg text-xs font-bold flex items-center justify-center shadow"
                  title="Criar novo fluxo"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lista de fluxogramas salvos */}
            {flowchartsList.length > 0 && (
              <div className="bg-white/40 p-2.5 rounded-lg border border-[#DCD3B6] space-y-1.5 max-h-[120px] overflow-y-auto">
                <span className="text-[9px] font-bold text-[#0B2545]/70 uppercase tracking-wider block">Fluxos Salvos no Banco:</span>
                {flowchartsList.map((flow) => (
                  <div key={flow.id} className={`flex items-center justify-between p-1.5 rounded text-xs transition-colors ${flow.id === activeFlowId ? 'bg-[#006335]/10 font-bold text-[#006335]' : 'hover:bg-slate-100 text-slate-600'}`}>
                    <button 
                      onClick={() => {
                        setActiveFlowId(flow.id);
                        setFlowchartTitle(flow.title);
                        setInputText(flow.content);
                      }}
                      className="text-left truncate flex-1 block"
                    >
                      {flow.title}
                    </button>
                    {flowchartsList.length > 1 && (
                      <button 
                        onClick={() => handleDeleteFlow(flow.id)} 
                        className="text-rose-600 hover:text-rose-800 p-1 block"
                        title="Deletar este fluxo"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1 flex flex-col min-h-[200px]">
              <textarea
                className="w-full flex-1 bg-white border border-[#D5CBB3] rounded-lg p-3 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006335]/40 focus:border-[#006335] transition resize-none leading-relaxed shadow-inner"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Insira os dados de produção aqui..."
              />
            </div>

            {/* Injeção rápida de templates de setores */}
            <div className="bg-white/80 p-3 rounded-lg border border-[#DCD3B6] shadow-sm">
              <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wider block mb-2">Adicionar Macro Setor:</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => addSectorTemplate('corte')}
                  className="bg-[#0B2545] hover:bg-[#163b65] text-[#FDFBF7] py-2 px-1 text-center text-[10px] font-semibold rounded transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <PlusIcon className="w-3 h-3 text-[#006335]" /> Corte
                </button>
                <button 
                  onClick={() => addSectorTemplate('producao')}
                  className="bg-[#0B2545] hover:bg-[#163b65] text-[#FDFBF7] py-2 px-1 text-center text-[10px] font-semibold rounded transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <PlusIcon className="w-3 h-3 text-[#006335]" /> Costura
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visualizador Operacional */}
        <div className="flex-1 bg-[#FDFBF7] overflow-y-auto p-6 transition-all duration-300 flex flex-col">
          
          {/* TAB 1: FLUXOGRAMA LINEAR */}
          {activeTab === 'tree-flow' && (
            <div className="space-y-8 max-w-5xl mx-auto w-full">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
                <div>
                  <h3 className="text-lg font-bold text-[#0B2545]">Fluxograma Contínuo &amp; Ramificado</h3>
                  <p className="text-xs text-slate-500">
                    Espinha dorsal vertical contínua com as ramificações de processos localizadas diretamente ao lado de cada setor.
                  </p>
                </div>
              </div>

              {parsedData.length === 0 ? (
                <div className="text-center py-20 bg-[#F4EFE6]/50 border border-dashed border-[#DCD3B6] rounded-xl">
                  <p className="text-slate-500 text-sm font-medium">Nenhum fluxo encontrado. Crie dados de fábrica no editor para gerar.</p>
                </div>
              ) : (
                <div className="relative pl-6 md:pl-10 space-y-12">
                  
                  {/* Linha Contínua da Espinha Dorsal (Esquerda) */}
                  <div className="absolute left-[21px] md:left-[25px] top-6 bottom-6 w-1 bg-[#006335] rounded-full z-0"></div>

                  {parsedData.map((sector, sIdx) => (
                    <div key={sIdx} className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-6">
                      
                      {/* Nó do Setor Principal */}
                      <div className="flex items-center space-x-4 min-w-[200px] md:min-w-[240px]">
                        <div className="w-11 h-11 rounded-full bg-[#0B2545] border-4 border-[#006335] text-white flex items-center justify-center font-bold text-sm shadow-md z-20 shrink-0">
                          {sIdx + 1}
                        </div>
                        <div className="bg-[#0B2545] text-white p-3.5 rounded-xl shadow-md border-b-4 border-[#006335] w-full flex items-center space-x-3">
                          <span className="p-1.5 bg-white/10 text-white rounded">
                            {getSectorIcon(sector.name)}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-xs tracking-wide uppercase">{sector.name}</h4>
                            <span className="text-[9px] font-mono text-slate-300 block">Fase Operacional</span>
                          </div>
                        </div>
                      </div>

                      {/* Seta horizontal conectora */}
                      <div className="hidden lg:flex text-[#006335] items-center justify-center">
                        <ArrowRightIcon className="w-6 h-6" />
                      </div>

                      {/* Ramificações à Direita */}
                      <div className="flex-1 bg-white border border-[#E5DEC9] rounded-2xl p-5 shadow-sm space-y-4 w-full lg:w-auto">
                        {/* Processos Principais do Setor */}
                        {sector.processes.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold text-[#006335] uppercase tracking-wider block">Atividades de Fluxo Principal:</span>
                            <div className="flex flex-wrap items-center gap-y-3 gap-x-2">
                              {sector.processes.map((proc, pIdx) => (
                                <React.Fragment key={pIdx}>
                                  <div className="bg-[#FDFBF7] border border-[#006335]/30 text-[#0B2545] py-2.5 px-3 rounded-lg shadow-sm font-bold text-xs flex items-center space-x-2">
                                    <span className="w-4 h-4 rounded-full bg-[#006335] text-white text-[9px] flex items-center justify-center font-bold">
                                      {pIdx + 1}
                                    </span>
                                    <span>{proc}</span>
                                  </div>
                                  {pIdx < sector.processes.length - 1 && (
                                    <ArrowRightIcon className="w-4 h-4 text-[#006335] shrink-0" />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Processos Secundários de Apoio */}
                        {sector.secondaryProcesses.length > 0 && (
                          <div className="pt-3 border-t border-slate-100 space-y-2">
                            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Roteiros Secundários de Apoio:</span>
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-2">
                              {sector.secondaryProcesses.map((extra, eIdx) => (
                                <div key={eIdx} className="bg-white border border-dashed border-amber-500 text-slate-700 py-1.5 px-3 rounded-lg font-bold text-[11px] flex items-center space-x-1.5 shadow-sm">
                                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block shrink-0 animate-pulse"></span>
                                  <span>{extra}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}

                </div>
              )}
            </div>
          )}

          {/* TAB 2: FLUXOGRAMA VISUAL */}
          {activeTab === 'visual-flow' && (
            <div className="space-y-8 max-w-5xl mx-auto w-full">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
                <div>
                  <h3 className="text-lg font-bold text-[#0B2545]">Fluxograma Visual</h3>
                  <p className="text-xs text-slate-500">
                    Cadeia principal conectada horizontalmente com fluxos secundários de apoio ramificados em cascata vertical.
                  </p>
                </div>
              </div>

              {parsedData.length === 0 ? (
                <div className="text-center py-20 bg-[#F4EFE6]/50 border border-dashed border-[#DCD3B6] rounded-xl">
                  <p className="text-slate-500 text-sm">Nenhum fluxo para representar. Crie setores no editor!</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {parsedData.map((sector, sIdx) => (
                    <div key={sIdx} className="bg-white border border-[#E5DEC9] rounded-2xl shadow-md p-6 space-y-6 hover:border-[#006335]/30 transition-all">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-1.5 bg-[#0B2545] text-white rounded">
                            {getSectorIcon(sector.name)}
                          </div>
                          <h4 className="font-extrabold text-[#0B2545] text-base">{sector.name}</h4>
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase">Setor {sIdx + 1}</span>
                      </div>

                      <div className="flex flex-col space-y-8">
                        {/* Linha Horizontal Principal */}
                        <div className="flex flex-wrap items-stretch justify-start gap-y-4 gap-x-2">
                          {sector.processes.map((proc, pIdx) => {
                            const correspondingSupport = sector.secondaryProcesses[pIdx];

                            return (
                              <div key={pIdx} className="flex flex-col items-center">
                                <div className="flex items-center">
                                  <div className="flex flex-col items-stretch max-w-[200px]">
                                    <div className="bg-[#FDFBF7] border-2 border-[#006335] text-[#0B2545] p-3 rounded-lg shadow-sm font-bold text-xs text-center min-h-[56px] flex items-center justify-center">
                                      <div>
                                        <span className="block text-[8px] font-mono text-[#006335] uppercase mb-0.5">Etapa {pIdx + 1}</span>
                                        {proc}
                                      </div>
                                    </div>

                                    {/* Queda em cascata para processo de apoio */}
                                    {correspondingSupport && (
                                      <div className="flex flex-col items-center mt-2">
                                        <ArrowDownIcon className="w-4 h-4 text-amber-500" />
                                        <div className="bg-white border-2 border-amber-500 text-slate-700 p-2.5 rounded-lg shadow-sm text-[11px] font-semibold text-center mt-1 border-dashed max-w-[170px]">
                                          <span className="block text-[8px] font-mono text-amber-600 uppercase mb-0.5">Apoio</span>
                                          {correspondingSupport}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Seta Direcional de Sequenciamento */}
                                  {pIdx < sector.processes.length - 1 && (
                                    <div className="mx-2 text-[#006335] flex items-center justify-center">
                                      <ArrowRightIcon className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CADEIA DE VALOR (RAIAS) */}
          {activeTab === 'swimlanes' && (
            <div className="space-y-8 max-w-5xl mx-auto w-full">
              <div className="border-b border-[#E5DEC9] pb-3">
                <h3 className="text-lg font-bold text-[#0B2545]">Cadeia de Valor vs Apoio</h3>
                <p className="text-xs text-slate-500">Divisão de raias horizontais destacando processos principais e suporte.</p>
              </div>

              {parsedData.map((sector, sIdx) => (
                <div key={sIdx} className="bg-white border border-[#E5DEC9] rounded-xl overflow-hidden shadow-md">
                  <div className="bg-[#0B2545] text-white px-5 py-3 font-bold text-sm border-b-2 border-[#006335]">
                    {sector.name}
                  </div>

                  <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#E5DEC9] bg-[#FDFBF7]">
                    <div className="flex-1 p-5 space-y-4">
                      <span className="text-xs font-bold text-[#006335] uppercase">Linha de Frente (Valor)</span>
                      <div className="space-y-2">
                        {sector.processes.map((proc, pIdx) => (
                          <div key={pIdx} className="bg-white p-3 rounded-lg shadow-sm border border-[#E5DEC9] text-xs font-bold text-[#0B2545]">
                            {proc}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 p-5 space-y-4 bg-slate-50/50">
                      <span className="text-xs font-bold text-amber-600 uppercase">Processos Auxiliares (Suporte)</span>
                      <div className="space-y-2">
                        {sector.secondaryProcesses.length > 0 ? (
                          sector.secondaryProcesses.map((proc, pIdx) => (
                            <div key={pIdx} className="bg-white p-3 rounded-lg shadow-sm border border-[#E5DEC9] text-xs font-semibold text-slate-600">
                              {proc}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">Sem tarefas secundárias mapeadas.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: GARGALOS & PLANOS */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              <div className="bg-[#0B2545] p-5 rounded-xl border-b-4 border-[#006335] text-white shadow-md">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <AlertTriangleIcon className="text-amber-400 w-5 h-5" />
                  Painel de Otimização e Diagnósticos Detectados
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Varredura inteligente que aponta automaticamente riscos operacionais, oportunidades de novos POPs (Procedimentos Operacionais Padrão) e pontos de perda com base nos dados do seu fluxo.
                </p>
              </div>

              {/* Grid de Diagnósticos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Gargalos */}
                <div className="bg-white p-5 rounded-xl border border-[#E5DEC9] shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#E5DEC9]">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <h4 className="font-bold text-sm text-rose-700">Gargalos e Atrasos Mapeados</h4>
                  </div>

                  <div className="space-y-3">
                    {parsedData.some(s => s.observations.some(o => analyzeObservation(o).type === 'gargalo')) ? (
                      parsedData.map(sector => 
                        sector.observations.map((obs, idx) => {
                          const analyzed = analyzeObservation(obs);
                          if (analyzed.type !== 'gargalo') return null;
                          return (
                            <div key={idx} className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs space-y-1 shadow-sm">
                              <span className="font-bold text-[10px] text-rose-700 uppercase tracking-widest">{sector.name}</span>
                              <p className="text-rose-900 font-semibold">{analyzed.text}</p>
                            </div>
                          );
                        })
                      )
                    ) : (
                      <p className="text-xs text-slate-500 italic">Nenhum gargalo explícito mapeado nas observações.</p>
                    )}
                  </div>
                </div>

                {/* Oportunidades de POP */}
                <div className="bg-white p-5 rounded-xl border border-[#E5DEC9] shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#E5DEC9]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006335]"></span>
                    <h4 className="font-bold text-sm text-[#006335]">Oportunidades de POP e Indicadores</h4>
                  </div>

                  <div className="space-y-3">
                    {parsedData.some(s => s.observations.some(o => analyzeObservation(o).type === 'oportunidade')) ? (
                      parsedData.map(sector => 
                        sector.observations.map((obs, idx) => {
                          const analyzed = analyzeObservation(obs);
                          if (analyzed.type !== 'oportunidade') return null;
                          return (
                            <div key={idx} className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs space-y-1 shadow-sm">
                              <span className="font-bold text-[10px] text-[#006335] uppercase tracking-widest">{sector.name}</span>
                              <p className="text-emerald-900 font-semibold">{analyzed.text}</p>
                            </div>
                          );
                        })
                      )
                    ) : (
                      <p className="text-xs text-slate-500 italic">Nenhuma sugestão de indicador ou nova melhoria estruturada.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Tabela de POPs Recomendados */}
              <div className="bg-white p-6 rounded-xl border border-[#E5DEC9] shadow-sm">
                <h4 className="font-bold text-sm text-[#0B2545] mb-4 flex items-center gap-2">
                  <FileTextIcon className="text-[#006335] w-4.5 h-4.5" />
                  Sugestão de Matriz de POPs a Criar para a Vickytex
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5DEC9] text-[#0B2545] font-semibold font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">ID sugerido</th>
                        <th className="py-2.5 px-3">Processo Alvo</th>
                        <th className="py-2.5 px-3">Objetivo do POP</th>
                        <th className="py-2.5 px-3">Impacto Esperado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DEC9] text-slate-700 font-medium">
                      <tr>
                        <td className="py-3 px-3 font-bold text-[#006335] font-mono">POP-CONF-01</td>
                        <td className="py-3 px-3 text-[#0B2545]">Contagem e conferência</td>
                        <td className="py-3 px-3">Padronizar aferição por peso eletrônico versus manual</td>
                        <td className="py-3 px-3 text-[#006335]">Eliminar retrabalho e agilizar a conferência de facção</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-[#006335] font-mono">POP-EMB-02</td>
                        <td className="py-3 px-3 text-[#0B2545]">Embalagem (Triagem)</td>
                        <td className="py-3 px-3">Fazer a rastreabilidade e pontuação de defeitos gerados por facção</td>
                        <td className="py-3 px-3 text-[#006335]">Diminuir lotes com defeito e aumentar qualidade dos produtos</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-[#006335] font-mono">POP-EXP-03</td>
                        <td className="py-3 px-3 text-[#0B2545]">Expedição / Logística</td>
                        <td className="py-3 px-3">Sincronizar programação de transporte com a separação física do lote</td>
                        <td className="py-3 px-3 text-[#006335]">Reduzir o tempo de pátio e atrasos de frete</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GUIA SINTAXE */}
          {activeTab === 'guide' && (
            <div className="space-y-6 max-w-2xl mx-auto bg-white p-6 rounded-xl border border-[#E5DEC9] w-full shadow-sm">
              <h3 className="text-lg font-bold text-[#0B2545] flex items-center gap-2">
                <HelpCircleIcon className="text-[#006335] w-5 h-5" />
                Guia de Sintaxe Operacional
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Este mapeador de processos converte linhas simples de texto em fluxogramas dinâmicos em tempo real. Veja abaixo os códigos e tags aceitos pelo interpretador:
              </p>

              <div className="space-y-4 pt-4 border-t border-[#E5DEC9]">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-[#006335] font-bold bg-[#006335]/10 px-2 py-1 rounded border border-[#006335]/20">* Nome do Setor</span>
                  <p className="text-xs text-slate-600 pl-2 mt-1">Define um macro setor (Espinha dorsal esquerda ou novo nó principal).</p>
                  <pre className="text-[10px] bg-[#FDFBF7] p-2 rounded text-[#0B2545] font-mono border border-[#E5DEC9] mt-1">* Recebimento</pre>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-[#006335] font-bold bg-[#006335]/10 px-2 py-1 rounded border border-[#006335]/20">- Etapa A {"->"} Etapa B</span>
                  <p className="text-xs text-slate-600 pl-2 mt-1">Desenha os processos contínuos de linha de frente (Cadeia de Valor).</p>
                  <pre className="text-[10px] bg-[#FDFBF7] p-2 rounded text-[#0B2545] font-mono border border-[#E5DEC9] mt-1">- Descarga {"->"} Conferência</pre>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-[#006335] font-bold bg-[#006335]/10 px-2 py-1 rounded border border-[#006335]/20">-- Suporte X {"->"} Suporte Y</span>
                  <p className="text-xs text-slate-600 pl-2 mt-1">Define caminhos auxiliares, processos secundários ou fluxos de apoio.</p>
                  <pre className="text-[10px] bg-[#FDFBF7] p-2 rounded text-[#0B2545] font-mono border border-[#E5DEC9] mt-1">-- Separar peças para conserto</pre>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono text-[#006335] font-bold bg-[#006335]/10 px-2 py-1 rounded border border-[#006335]/20">= Alerta Operacional</span>
                  <p className="text-xs text-slate-600 pl-2 mt-1">Adiciona diagnósticos sobre gargalos e oportunidades analisados pelo sistema.</p>
                  <pre className="text-[10px] bg-[#FDFBF7] p-2 rounded text-[#0B2545] font-mono border border-[#E5DEC9] mt-1">= Processo muito demorado</pre>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      <footer className="bg-[#0B2545] border-t-2 border-[#006335] text-center py-3 text-[10px] text-slate-300 font-medium">
        Vickytex Indústria e Comércio de Vestuário - Santa Catarina. Editor de Processos v2.5
      </footer>
    </div>
  );
}
