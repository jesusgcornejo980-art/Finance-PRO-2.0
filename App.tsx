import React, { useState, useEffect } from 'react';
import { Screen1 } from './components/screens/Screen1';
import { Screen2 } from './components/screens/Screen2';
import { Screen3 } from './components/screens/Screen3';
import { Screen4 } from './components/screens/Screen4';
import { Screen5 } from './components/screens/Screen5';
import { Screen6 } from './components/screens/Screen6';
import { Screen7 } from './components/screens/Screen7';
import { Screen8 } from './components/screens/Screen8';
import { Screen9 } from './components/screens/Screen9';
import { Screen10 } from './components/screens/Screen10';
import { Screen11 } from './components/screens/Screen11';
import { Screen12 } from './components/screens/Screen12';
import { Screen12_1 } from './components/screens/Screen12_1';
import { Screen12_2 } from './components/screens/Screen12_2';
import { Screen13 } from './components/screens/Screen13';
import { Screen14 } from './components/screens/Screen14';
import { AppStep, Section, DebtItem, PaymentMethod, DateRange, InternalTransfer, Transaction, Language, Currency, Notification } from './types';
import { translations } from './utils/i18n';

function App() {
  // Initialize step based on localStorage to skip onboarding on subsequent visits
  // This ensures screens 1-10 are only shown the first time the app is opened (New User)
  // Returning users go straight to SCREEN_11
  const [step, setStep] = useState<AppStep>(() => {
    const hasCompletedOnboarding = localStorage.getItem('finance_pro_onboarding_complete');
    return hasCompletedOnboarding === 'true' ? AppStep.SCREEN_11 : AppStep.SCREEN_1;
  });

  const [hasSeenTransactionIntro, setHasSeenTransactionIntro] = useState(false);
  const [language, setLanguage] = useState<Language>('es');
  const [currency, setCurrency] = useState<Currency>('USD');
  
  // Flag to know if we are in "Settings Mode" (Editing from Profile) or "Onboarding Mode"
  const [settingsMode, setSettingsMode] = useState(false);
  
  // State for Weekly Balance
  const [weeklyBalance, setWeeklyBalance] = useState<number>(0);
  
  // State for Transaction Count
  const [transactionCount, setTransactionCount] = useState<number>(0);

  // State for Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
        id: '1',
        title: 'Presupuesto al límite',
        message: 'Has utilizado el 90% de tu presupuesto de "Gustos" esta semana.',
        date: new Date(),
        read: false,
        type: 'warning'
    },
    {
        id: '2',
        title: 'Pago Recibido',
        message: 'Se ha registrado un ingreso de nómina correctamente.',
        date: new Date(Date.now() - 86400000), // Yesterday
        read: true,
        type: 'success'
    }
  ]);

  // Lifted state from Screen7 - Initialized Empty
  const [debts, setDebts] = useState<DebtItem[]>([]);

  // Check for Debt Reminders (1 week before payment day)
  useEffect(() => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      debts.forEach(debt => {
          if (!debt.paymentDay) return;

          // Calculate next payment date
          let paymentDate = new Date(currentYear, currentMonth, debt.paymentDay);
          
          // If payment day for this month has passed, check next month (though logic below for 7 days ahead handles this)
          // But specifically, if today is 25th and payment is 2nd, the next payment is next month.
          if (paymentDate < today) {
              paymentDate = new Date(currentYear, currentMonth + 1, debt.paymentDay);
          }

          // Calculate difference in milliseconds
          const diffTime = paymentDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

          // If exactly 7 days remaining (or within a reasonable window like 6-7 days to catch it)
          if (diffDays === 7 || diffDays === 6) {
              const notificationId = `remind-${debt.id}-${paymentDate.toISOString().split('T')[0]}`;
              
              // Check if notification already exists to avoid duplicates
              setNotifications(prev => {
                  if (prev.some(n => n.id === notificationId)) return prev;
                  
                  return [{
                      id: notificationId,
                      title: 'Recordatorio de Pago',
                      message: `Tu pago de "${debt.name}" vence en 1 semana (Día ${debt.paymentDay}).`,
                      date: new Date(),
                      read: false,
                      type: 'info'
                  }, ...prev];
              });
          }
      });
  }, [debts]);

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDismissNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // State to track if the user came from Weekly or Monthly view
  const [analysisViewMode, setAnalysisViewMode] = useState<'weekly' | 'monthly'>('weekly');

  // State for Date Range Filter (Default: Current Week)
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1; // Monday
    const last = first + 6; // Sunday
    return {
      startDate: new Date(curr.setDate(first)),
      endDate: new Date(curr.setDate(last))
    };
  });
  
  // State for Spent Amounts per category group
  const [spentAmounts, setSpentAmounts] = useState({
    needs: 0,
    savings: 0,
    wants: 0
  });

  // Lifted state from Screen6
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'needs',
      title: 'NECESIDADES',
      percent: '50%',
      color: 'text-purple-400',
      items: [
        { id: '1', name: 'Vivienda', icon: 'home' },
        { id: '2', name: 'Alimentación', icon: 'shopping-cart' },
      ]
    },
    {
      id: 'savings',
      title: 'AHORRO',
      percent: '30%',
      color: 'text-fuchsia-400',
      items: [
        { id: '3', name: 'Fondo Emergencia', icon: 'shield' },
        { id: '4', name: 'Inversiones', icon: 'trending-up' },
      ]
    },
    {
        id: 'wants',
        title: 'GUSTOS',
        percent: '20%',
        color: 'text-violet-400',
        items: [
          { id: '5', name: 'Entretenimiento', icon: 'film' },
          { id: '6', name: 'Salidas y Restaurantes', icon: 'utensils' },
        ]
      }
  ]);

  // Lifted state from Screen8 - Initialized Empty
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  // State for Internal Transfers - Initialized Empty
  const [internalTransfers, setInternalTransfers] = useState<InternalTransfer[]>([]);

  // State for Transactions (Income/Expense) - Initialized Empty
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Current Translations
  const t = translations[language];

  // --- GLOBAL KEYBOARD & VIEWPORT ADJUSTMENT LOGIC ---
  useEffect(() => {
    // 1. Handle element focus
    const handleFocus = (e: Event) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };

    // 2. Handle viewport resize (Virtual Keyboard appearing/disappearing)
    const handleVisualViewportResize = () => {
      // If a text field is focused when the keyboard opens/closes, ensure it stays visible
      if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
         setTimeout(() => {
            document.activeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
         }, 100);
      }
    };

    document.addEventListener('focus', handleFocus, true);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
    }

    return () => {
      document.removeEventListener('focus', handleFocus, true);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
      }
    };
  }, []);

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  // This function marks the user as registered
  const goToDashboard = () => {
    localStorage.setItem('finance_pro_onboarding_complete', 'true');
    setSettingsMode(false);
    setStep(AppStep.SCREEN_11);
  };

  const goToAnalysis = () => {
    setSettingsMode(false);
    setStep(AppStep.SCREEN_12);
  };
  
  const goToDetailedAnalysis = () => {
    setStep(AppStep.SCREEN_12_1);
  };
  
  const goToCards = () => {
      setSettingsMode(false);
      setStep(AppStep.SCREEN_13);
  };

  const goToProfile = () => {
      setSettingsMode(true);
      setStep(AppStep.SCREEN_14);
  };

  const goToDateFilter = (mode: 'weekly' | 'monthly' = 'weekly') => {
    setAnalysisViewMode(mode);
    setStep(AppStep.SCREEN_12_2);
  };

  const openAddTransaction = () => {
    setStep(AppStep.SCREEN_10);
  };

  const handleDateFilterApply = (start: Date, end: Date) => {
      setDateRange({ startDate: start, endDate: end });
      goToDetailedAnalysis();
  };

  // Handler for finishing Payment Methods setup (Screen 8)
  const handleFinishMethodsSetup = () => {
      // Calculate total initial balance from liquid assets (Cash & Debit) defined in Screen 8.
      // Credit cards are excluded as they typically represent debt capacity or available credit, not owned funds.
      const totalLiquidAssets = methods.reduce((acc, curr) => {
          if (curr.type === 'cash' || curr.type === 'debit') {
              return acc + (parseFloat(curr.balance) || 0);
          }
          return acc;
      }, 0);

      // Only set this as the Weekly Balance during the initial onboarding (Screen 8)
      // If editing from Profile (settingsMode), we don't automatically overwrite the balance
      // as that would erase current spending progress unless explicitly desired.
      if (!settingsMode) {
          setWeeklyBalance(totalLiquidAssets);
      }

      // Proceed navigation
      if (settingsMode) {
          goToProfile();
      } else {
          nextStep();
      }
  };

  // Handler for Adding/Editing Methods in Screen 13
  const handleSaveMethod = (method: PaymentMethod) => {
      // Check if it's a new method (not in current list)
      const exists = methods.some(m => m.id === method.id);
      
      // Update the methods list
      setMethods(prev => {
          if (exists) {
              return prev.map(m => m.id === method.id ? method : m);
          }
          return [...prev, method];
      });

      // Logic: If it is a NEW method AND NOT a credit card, add balance to weekly balance
      if (!exists && method.type !== 'credit') {
          const amount = parseFloat(method.balance) || 0;
          if (amount > 0) {
              setWeeklyBalance(prev => prev + amount);
          }
      }
  };

  // Helper to reset app state (Simulate Logout/Clear Data)
  const handleResetApp = () => {
      localStorage.removeItem('finance_pro_onboarding_complete');
      setStep(AppStep.SCREEN_1);
      setSettingsMode(false);
      // Optional: Clear data
      setTransactions([]);
      setWeeklyBalance(0);
      setSpentAmounts({ needs: 0, savings: 0, wants: 0 });
  };

  // --- LOGIC TO DELETE/REVERT A TRANSACTION ---
  const handleDeleteTransaction = (id: string) => {
      const tx = transactions.find(t => t.id === id);
      if (!tx) return;

      // 1. Revert Method Balance
      setMethods(prev => prev.map(m => {
          if (m.name === tx.methodName) { 
               const current = parseFloat(m.balance);
               // If it was income, we remove it (sub). If expense, we add it back.
               const newBal = tx.type === 'income' ? current - tx.amount : current + tx.amount;
               return { ...m, balance: newBal.toString() };
          }
          return m;
      }));

      // 2. Revert Weekly Balance & Spending Buckets
      if (tx.type === 'income') {
           setWeeklyBalance(prev => Math.max(0, prev - tx.amount));
           // If it was "Week Start", we can't easily revert the reset of spentAmounts, 
           // but we can adjust the balance.
           if (tx.isWeekStart) {
               setTransactionCount(prev => Math.max(0, prev - 1));
           }
      } else {
           // Expense Reversion
           setWeeklyBalance(prev => prev + tx.amount);
           
           if (tx.categoryName) {
               // Find which bucket this category belongs to
               const sectionId = sections.find(s => s.items.some(i => i.name === tx.categoryName))?.id;
               if (sectionId && (sectionId === 'needs' || sectionId === 'savings' || sectionId === 'wants')) {
                   setSpentAmounts(prev => ({
                       ...prev,
                       [sectionId]: Math.max(0, prev[sectionId as keyof typeof prev] - tx.amount)
                   }));
                   
                   // Check if it was a SAVINGS category expense (Auto-Transfer)
                   // If so, we need to revert the deposit to the savings account
                   if (sectionId === 'savings') {
                       setMethods(prevMethods => prevMethods.map(m => {
                           if (m.name === tx.categoryName && m.isReadOnly) {
                               const current = parseFloat(m.balance);
                               return { ...m, balance: Math.max(0, current - tx.amount).toString() };
                           }
                           return m;
                       }));
                   }
               }
           }
           
           if (tx.debtName) {
               // Revert Debt Payment (Increase current debt)
               setDebts(prev => prev.map(d => {
                   if (d.name === tx.debtName) {
                       const curr = parseFloat(d.current);
                       return { ...d, current: (curr + tx.amount).toString() };
                   }
                   return d;
               }));
           }
      }

      // 3. Remove from List
      setTransactions(prev => prev.filter(t => t.id !== id));
      setTransactionCount(prev => Math.max(0, prev - 1));
  };

  // --- LOGIC TO DELETE/REVERT A TRANSFER ---
  const handleDeleteTransfer = (id: string) => {
      const tr = internalTransfers.find(t => t.id === id);
      if (!tr) return;

      setMethods(prev => prev.map(m => {
          // Add back to Source (Amount + Commission)
          if (m.id === tr.fromId) {
              const current = parseFloat(m.balance);
              return { ...m, balance: (current + tr.amount + tr.commission).toString() };
          }
          // Subtract from Destination (Amount)
          if (m.id === tr.toId) {
              const current = parseFloat(m.balance);
              return { ...m, balance: (current - tr.amount).toString() };
          }
          return m;
      }));

      setInternalTransfers(prev => prev.filter(t => t.id !== id));
  };

  // --- LOGIC TO UPDATE TRANSACTION ---
  const handleUpdateTransaction = (id: string, newAmount: number, newDescription: string) => {
      const tx = transactions.find(t => t.id === id);
      if (!tx) return;

      const diff = newAmount - tx.amount;
      if (diff === 0 && newDescription === tx.description) return; // No change

      // 1. Update Method Balance with Diff
      setMethods(prev => prev.map(m => {
          if (m.name === tx.methodName) { 
               const current = parseFloat(m.balance);
               // Income: +diff, Expense: -diff
               const newBal = tx.type === 'income' ? current + diff : current - diff;
               return { ...m, balance: newBal.toString() };
          }
          return m;
      }));

      // 2. Update Weekly & Spent with Diff
      if (tx.type === 'income') {
           setWeeklyBalance(prev => prev + diff);
      } else {
           setWeeklyBalance(prev => prev - diff); // Expense increases, balance decreases
           
           if (tx.categoryName) {
               const sectionId = sections.find(s => s.items.some(i => i.name === tx.categoryName))?.id;
               if (sectionId) {
                   setSpentAmounts(prev => ({
                       ...prev,
                       [sectionId]: prev[sectionId as keyof typeof prev] + diff
                   }));
                   
                   // Check if Savings -> Update Auto-Savings Account
                   if (sectionId === 'savings') {
                        setMethods(prevMethods => prevMethods.map(m => {
                           if (m.name === tx.categoryName && m.isReadOnly) {
                               const current = parseFloat(m.balance);
                               // Expense increased = Savings increased
                               return { ...m, balance: (current + diff).toString() };
                           }
                           return m;
                       }));
                   }
               }
           }
           if (tx.debtName) {
               setDebts(prev => prev.map(d => {
                   if (d.name === tx.debtName) {
                       const curr = parseFloat(d.current);
                       // If expense increased (positive diff), debt decreases (subtract diff)
                       return { ...d, current: (curr - diff).toString() };
                   }
                   return d;
               }));
           }
      }

      // 3. Update Transaction Object
      setTransactions(prev => prev.map(t => {
          if (t.id === id) {
              return { ...t, amount: newAmount, description: newDescription };
          }
          return t;
      }));
  };

  // Logic to handle new transactions
  const handleSaveTransaction = (data: { amount: string; type: 'expense' | 'income'; isWeekStart: boolean; categoryId?: string; methodId?: string; debtId?: string; description?: string }) => {
    const value = parseFloat(data.amount);
    
    if (!isNaN(value)) {
        // Handle Transaction Counter
        if (data.type === 'income' && data.isWeekStart) {
             setTransactionCount(1);
        } else {
             setTransactionCount(prev => prev + 1);
        }

        // --- RECORD HISTORY ---
        const methodName = methods.find(m => m.id.toString() === data.methodId)?.name || 'Cuenta Desconocida';
        let categoryName = undefined;
        let debtName = undefined;

        if (data.categoryId) {
            for (const sec of sections) {
                const item = sec.items.find(i => i.id === data.categoryId);
                if (item) {
                    categoryName = item.name;
                    break;
                }
            }
        }

        if (data.debtId) {
            debtName = debts.find(d => d.id.toString() === data.debtId)?.name;
        }

        const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: data.type,
            amount: value,
            date: new Date(),
            methodName: methodName,
            categoryName: categoryName,
            debtName: debtName,
            description: data.description,
            isDebtPayment: !!data.debtId,
            isWeekStart: data.isWeekStart
        };

        setTransactions(prev => [newTransaction, ...prev]);
        // ----------------------

        // 1. ALWAYS Update Payment Method Balance
        if (data.methodId) {
             setMethods(prevMethods => prevMethods.map(m => {
                 if (m.id.toString() === data.methodId) {
                     const currentBalance = parseFloat(m.balance) || 0;
                     const newBalance = data.type === 'income' 
                        ? currentBalance + value 
                        : currentBalance - value;
                     return { ...m, balance: newBalance.toString() };
                 }
                 return m;
             }));
        }

        // 2. Handle Weekly Balance Logic
        if (data.type === 'income') {
            if (data.isWeekStart) {
                setWeeklyBalance(value);
                // PERSIST SAVINGS: Reset needs and wants, but keep accumulated savings
                setSpentAmounts(prev => ({ 
                    needs: 0, 
                    wants: 0, 
                    savings: prev.savings 
                }));
            } else {
                setWeeklyBalance((prev) => prev + value);
            }
        } else {
            setWeeklyBalance((prev) => Math.max(0, prev - value));
            
            if (data.debtId) {
                setDebts(prevDebts => prevDebts.map(d => {
                    if (d.id.toString() === data.debtId) {
                        const currentDebt = parseFloat(d.current) || 0;
                        const newDebt = Math.max(0, currentDebt - value);
                        return { ...d, current: newDebt.toString() };
                    }
                    return d;
                }));
            }
            else if (data.categoryId) {
                 const sectionId = sections.find(s => s.items.some(i => i.id === data.categoryId))?.id;
                 if (sectionId && (sectionId === 'needs' || sectionId === 'savings' || sectionId === 'wants')) {
                     setSpentAmounts(prev => ({
                         ...prev,
                         [sectionId]: prev[sectionId as keyof typeof prev] + value
                     }));

                     // --- AUTO-CREATE SAVINGS ACCOUNT LOGIC ---
                     // If an expense is categorized under 'savings', we create/update a special account
                     if (sectionId === 'savings') {
                         const savingsSection = sections.find(s => s.id === 'savings');
                         const categoryItem = savingsSection?.items.find(i => i.id === data.categoryId);
                         
                         if (categoryItem) {
                             const accountName = categoryItem.name; // e.g., "Fondo Emergencia" or "Inversiones"
                             
                             setMethods(prevMethods => {
                                 // Check if account already exists
                                 const existingAccount = prevMethods.find(m => m.name === accountName);
                                 
                                 if (existingAccount) {
                                     // Update existing savings account balance (Add the "expense" amount to it)
                                     return prevMethods.map(m => 
                                         m.id === existingAccount.id 
                                         ? { ...m, balance: (parseFloat(m.balance) + value).toString() } 
                                         : m
                                     );
                                 } else {
                                     // Create new Read-Only Savings Account
                                     const newSavingsAccount: PaymentMethod = {
                                         id: Date.now(),
                                         name: accountName,
                                         subtitle: 'Cuenta de Ahorro Automática',
                                         balance: value.toString(),
                                         type: 'cash', // Treated as liquid asset
                                         label: 'AHORRADO',
                                         isReadOnly: true // Blocks editing in Screen 13
                                     };
                                     return [...prevMethods, newSavingsAccount];
                                 }
                             });
                         }
                     }
                     // ----------------------------------------
                 }
            }
        }
    }
    
    // IMPORTANT: After first transaction (onboarding) or any transaction, go to dashboard
    goToDashboard();
  };

  const handleTransfer = (fromId: number, toId: number, amount: number, commission: number) => {
      setMethods(prevMethods => prevMethods.map(m => {
          if (m.id === fromId) {
              const current = parseFloat(m.balance);
              return { ...m, balance: (current - amount - commission).toString() };
          }
          if (m.id === toId) {
              const current = parseFloat(m.balance);
              return { ...m, balance: (current + amount).toString() };
          }
          return m;
      }));

      const fromMethod = methods.find(m => m.id === fromId);
      const toMethod = methods.find(m => m.id === toId);

      const newTransfer: InternalTransfer = {
          id: Date.now().toString(),
          fromId,
          toId,
          fromName: fromMethod?.name || 'Origen',
          toName: toMethod?.name || 'Destino',
          amount,
          date: new Date(),
          commission
      };

      setInternalTransfers(prev => [newTransfer, ...prev]);
  };

  const handleExportData = (
      format: 'excel' | 'pdf', 
      period: 'all' | 'current_month' | 'last_month', 
      dataConfig: { transactions: boolean, budgets: boolean, debts: boolean }
  ) => {
      // Export logic (same as before)
      const now = new Date();
      let filteredTransactions = [...transactions];
      
      // Filter logic
      if (period === 'current_month') {
          filteredTransactions = transactions.filter(t => 
              t.date.getMonth() === now.getMonth() && t.date.getFullYear() === now.getFullYear()
          );
      } else if (period === 'last_month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          filteredTransactions = transactions.filter(t => 
              t.date.getMonth() === lastMonth.getMonth() && t.date.getFullYear() === lastMonth.getFullYear()
          );
      }

      // Formatting Helper
      const fmt = (num: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency }).format(num);
      const safeStr = (str: string) => `"${(str || '').replace(/"/g, '""')}"`; // CSV escape

      if (format === 'excel') {
          // --- GENERATE CSV FOR EXCEL ---
          let csvContent = "\uFEFF"; // BOM for Excel UTF-8 support
          csvContent += `REPORTE FINANCE PRO\n`;
          csvContent += `Fecha Reporte,${new Date().toLocaleDateString()}\n`;
          csvContent += `Periodo,${period === 'all' ? 'Histórico Completo' : period === 'current_month' ? 'Este Mes' : 'Mes Pasado'}\n\n`;

          // 1. General Balance
          csvContent += `RESUMEN GENERAL\n`;
          csvContent += `Saldo Disponible Semanal,${fmt(weeklyBalance)}\n`;
          const totalSpent = spentAmounts.needs + spentAmounts.savings + spentAmounts.wants;
          csvContent += `Total Gastado (Presupuesto),${fmt(totalSpent)}\n\n`;

          // 2. Budgets (if selected)
          if (dataConfig.budgets) {
              const totalBase = weeklyBalance + totalSpent;
              csvContent += `PRESUPUESTO (50-30-20)\n`;
              csvContent += `Categoria,Asignado (Est.),Gastado,Estado\n`;
              
              const needsBudget = totalBase * 0.5;
              const wantsBudget = totalBase * 0.2;
              const savingsBudget = totalBase * 0.3;

              csvContent += `Necesidades (50%),${fmt(needsBudget)},${fmt(spentAmounts.needs)},${Math.round((spentAmounts.needs/needsBudget)*100) || 0}%\n`;
              csvContent += `Gustos (20%),${fmt(wantsBudget)},${fmt(spentAmounts.wants)},${Math.round((spentAmounts.wants/wantsBudget)*100) || 0}%\n`;
              csvContent += `Ahorro (30%),${fmt(savingsBudget)},${fmt(spentAmounts.savings)},${Math.round((spentAmounts.savings/savingsBudget)*100) || 0}%\n\n`;
          }

          // 3. Debts (if selected)
          if (dataConfig.debts) {
              csvContent += `DEUDAS\n`;
              csvContent += `Nombre,Detalle,Total Inicial,Saldo Actual,Progreso\n`;
              debts.forEach(d => {
                  const init = parseFloat(d.initial) || 0;
                  const curr = parseFloat(d.current) || 0;
                  const paidPct = init > 0 ? Math.round(((init - curr) / init) * 100) : 0;
                  csvContent += `${safeStr(d.name)},${safeStr(d.subtitle)},${fmt(init)},${fmt(curr)},${paidPct}% Pagado\n`;
              });
              csvContent += `\n`;
          }

          // 4. Transactions (if selected)
          if (dataConfig.transactions) {
              csvContent += `MOVIMIENTOS DETALLADOS\n`;
              csvContent += `Fecha,Tipo,Monto,Categoria/Deuda,Metodo Pago,Descripcion\n`;
              filteredTransactions.forEach(t => {
                  const categoryOrDebt = t.categoryName || t.debtName || (t.isWeekStart ? 'Inicio de Semana' : '-');
                  csvContent += `${t.date.toLocaleDateString()},${t.type.toUpperCase()},${t.amount},${safeStr(categoryOrDebt)},${safeStr(t.methodName)},${safeStr(t.description)}\n`;
              });
          }

          const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", `finance_pro_reporte_${new Date().toISOString().slice(0,10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

      } else {
          // --- GENERATE VISUAL REPORT (HTML/PDF SIMULATION) ---
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
              alert("Por favor habilita las ventanas emergentes para generar el PDF.");
              return;
          }

          // Visual calculations for charts
          const totalSpent = spentAmounts.needs + spentAmounts.savings + spentAmounts.wants;
          const totalIncome = weeklyBalance + totalSpent; // Approximate
          const needsPct = totalIncome > 0 ? (spentAmounts.needs / totalIncome) * 100 : 0;
          const wantsPct = totalIncome > 0 ? (spentAmounts.wants / totalIncome) * 100 : 0;
          const savingsPct = totalIncome > 0 ? (spentAmounts.savings / totalIncome) * 100 : 0;
          const remainingPct = 100 - needsPct - wantsPct - savingsPct;

          // Chart styling helper
          const conicGradient = `conic-gradient(
              #9333ea 0% ${needsPct}%, 
              #a855f7 ${needsPct}% ${needsPct + wantsPct}%, 
              #2dd4bf ${needsPct + wantsPct}% ${needsPct + wantsPct + savingsPct}%, 
              #27272a ${needsPct + wantsPct + savingsPct}% 100%
          )`;

          let html = `
            <html>
              <head>
                <title>Reporte Finance PRO</title>
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
                  
                  body { 
                    font-family: 'Inter', Helvetica, Arial, sans-serif; 
                    padding: 40px; 
                    color: #e5e7eb; 
                    background-color: #000000;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  
                  /* Watermark */
                  .watermark {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 100px;
                    font-weight: 800;
                    color: rgba(168, 85, 247, 0.05); 
                    z-index: -1;
                    pointer-events: none;
                    white-space: nowrap;
                    text-transform: uppercase;
                  }

                  h1 { 
                    color: #fff; 
                    margin-bottom: 5px; 
                    font-size: 28px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                  }
                  
                  .brand-pro {
                    background: linear-gradient(to right, #a855f7, #d946ef);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    color: #d946ef; 
                  }

                  h2 { 
                    margin-top: 40px; 
                    font-size: 14px; 
                    border-bottom: 1px solid #333; 
                    padding-bottom: 10px; 
                    color: #a78bfa; 
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-weight: 700;
                  }

                  .meta { 
                    color: #6b7280; 
                    font-size: 12px; 
                    margin-bottom: 40px;
                    line-height: 1.6;
                  }

                  /* TABLES */
                  table { 
                    width: 100%; 
                    border-collapse: separate; 
                    border-spacing: 0;
                    margin-top: 15px; 
                    font-size: 12px; 
                    border: 1px solid #27272a;
                    border-radius: 8px;
                    overflow: hidden;
                  }
                  th { 
                    background-color: #18181b; 
                    text-align: left; 
                    padding: 12px 16px; 
                    font-weight: bold; 
                    color: #9ca3af; 
                    border-bottom: 1px solid #27272a; 
                    text-transform: uppercase;
                    font-size: 10px;
                    letter-spacing: 1px;
                  }
                  td { 
                    padding: 12px 16px; 
                    border-bottom: 1px solid #27272a; 
                    color: #d1d5db; 
                  }
                  tr:last-child td { border-bottom: none; }
                  .amount { font-weight: bold; color: #fff; font-family: monospace; font-size: 13px; }
                  .expense { color: #f87171; }
                  .income { color: #34d399; }

                  /* CHARTS & CARDS */
                  .summary-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                  }
                  .card {
                    background-color: #12121a;
                    border: 1px solid #27272a;
                    border-radius: 12px;
                    padding: 20px;
                  }
                  .card-title {
                    font-size: 10px;
                    text-transform: uppercase;
                    color: #6b7280;
                    margin-bottom: 8px;
                    letter-spacing: 1px;
                    font-weight: bold;
                  }
                  
                  /* Simple Bar Chart for Summary */
                  .bar-container {
                    display: flex;
                    height: 8px;
                    background: #27272a;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-top: 5px;
                  }
                  .bar-fill { height: 100%; }
                  
                  /* Donut Chart Container */
                  .donut-container {
                    display: flex;
                    align-items: center;
                    gap: 30px;
                    padding: 20px;
                    background-color: #12121a;
                    border: 1px solid #27272a;
                    border-radius: 12px;
                  }
                  .donut {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: ${conicGradient};
                    position: relative;
                    flex-shrink: 0;
                  }
                  .donut::after {
                    content: "";
                    position: absolute;
                    inset: 20px;
                    background: #12121a;
                    border-radius: 50%;
                  }
                  .legend { flex: 1; }
                  .legend-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    font-size: 12px;
                  }
                  .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; }
                  
                  /* Debt Progress Bars */
                  .debt-item {
                    background-color: #12121a;
                    border: 1px solid #27272a;
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 10px;
                  }
                  .progress-track {
                    height: 6px;
                    background-color: #27272a;
                    border-radius: 3px;
                    overflow: hidden;
                    margin-top: 8px;
                  }
                  .progress-fill { height: 100%; }

                </style>
              </head>
              <body>
                <div class="watermark">Finance PRO</div>
                
                <h1>Finance <span class="brand-pro">PRO</span></h1>
                <div class="meta">
                    <strong>Reporte generado el:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}<br/>
                    <strong>Periodo:</strong> ${period === 'all' ? 'Histórico Completo' : period === 'current_month' ? 'Este Mes' : 'Mes Pasado'}<br/>
                    <strong>Moneda:</strong> ${currency}
                </div>
          `;

          // SUMMARY SECTION WITH BAR CHART
          // Total width = weeklyBalance + totalSpent
          const barTotal = weeklyBalance + totalSpent || 1;
          const balanceWidth = (weeklyBalance / barTotal) * 100;
          const spentWidth = (totalSpent / barTotal) * 100;

          html += `
            <h2>Resumen General</h2>
            <div class="summary-grid">
                <div class="card">
                    <div class="card-title">Flujo de Caja</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">${fmt(totalIncome)}</div>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${balanceWidth}%; background-color: #fff;"></div>
                        <div class="bar-fill" style="width: ${spentWidth}%; background-color: #a855f7;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 5px; color: #9ca3af;">
                        <span>Disponible: ${fmt(weeklyBalance)}</span>
                        <span>Gastado: ${fmt(totalSpent)}</span>
                    </div>
                </div>
                <div class="card">
                    <div class="card-title">Movimientos</div>
                    <div style="font-size: 24px; font-weight: bold;">${filteredTransactions.length}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Transacciones registradas</div>
                </div>
            </div>
          `;

          // BUDGETS SECTION WITH DONUT CHART
          if (dataConfig.budgets) {
              const totalBase = weeklyBalance + totalSpent;
              
              html += `
                <h2>Presupuesto 50-30-20</h2>
                <div class="donut-container">
                    <div class="donut"></div>
                    <div class="legend">
                        <div class="legend-item">
                            <div><span class="dot" style="background: #9333ea;"></span>NECESIDADES (50%)</div>
                            <div class="amount">${fmt(spentAmounts.needs)}</div>
                        </div>
                        <div class="legend-item">
                            <div><span class="dot" style="background: #a855f7;"></span>GUSTOS (20%)</div>
                            <div class="amount">${fmt(spentAmounts.wants)}</div>
                        </div>
                        <div class="legend-item">
                            <div><span class="dot" style="background: #2dd4bf;"></span>AHORRO (30%)</div>
                            <div class="amount">${fmt(spentAmounts.savings)}</div>
                        </div>
                        <div class="legend-item" style="color: #6b7280;">
                            <div><span class="dot" style="background: #27272a;"></span>RESTANTE</div>
                            <div>${fmt(weeklyBalance)}</div>
                        </div>
                    </div>
                </div>
              `;
          }

          // DEBTS SECTION WITH PROGRESS BARS
          if (dataConfig.debts) {
              html += `<h2>Mis Deudas</h2>`;
              debts.forEach(d => {
                  const init = parseFloat(d.initial) || 0;
                  const curr = parseFloat(d.current) || 0;
                  const paid = init - curr;
                  const pct = init > 0 ? (paid / init) * 100 : 0;
                  
                  // Color based on progress
                  const color = pct > 70 ? '#10b981' : pct > 30 ? '#d946ef' : '#7c3aed';

                  html += `
                    <div class="debt-item">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                            <span style="font-weight: bold; font-size: 13px;">${d.name}</span>
                            <span style="font-weight: bold; color: ${color};">${Math.round(pct)}%</span>
                        </div>
                        <div style="font-size: 10px; color: #6b7280; margin-bottom: 5px;">${d.subtitle}</div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${pct}%; background-color: ${color};"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 5px; color: #9ca3af;">
                            <span>Restante: <span style="color: #fff;">${fmt(curr)}</span></span>
                            <span>Total: ${fmt(init)}</span>
                        </div>
                    </div>
                  `;
              });
          }

          // TRANSACTIONS SECTION (Kept as table for detail clarity)
          if (dataConfig.transactions) {
              html += `<h2>Movimientos Detallados</h2><table><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Método</th><th>Monto</th></tr>`;
              filteredTransactions.forEach(t => {
                  const cat = t.categoryName || t.debtName || (t.isWeekStart ? 'Inicio Semana' : '-');
                  const amountClass = t.type === 'income' ? 'income' : 'expense';
                  const sign = t.type === 'income' ? '+' : '-';
                  html += `
                    <tr>
                        <td>${t.date.toLocaleDateString()}</td>
                        <td><span style="font-size: 10px; font-weight: bold; text-transform: uppercase;">${t.type}</span></td>
                        <td><div style="font-weight: bold;">${cat}</div><div style="font-size: 10px; color: #6b7280;">${t.description || ''}</div></td>
                        <td>${t.methodName}</td>
                        <td class="amount ${amountClass}">${sign}${fmt(t.amount)}</td>
                    </tr>`;
              });
              html += `</table>`;
          }

          html += `
                <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #52525b;">
                    Generado por Finance PRO App
                </div>
                <script>window.print();</script>
              </body>
            </html>
          `;

          printWindow.document.write(html);
          printWindow.document.close();
      }
  };

  const categoriesCount = sections.reduce((acc, curr) => acc + curr.items.length, 0);

  const renderStep = () => {
    switch (step) {
      case AppStep.SCREEN_1: return <Screen1 onNext={nextStep} />;
      case AppStep.SCREEN_2: return <Screen2 onNext={nextStep} onBack={prevStep} />;
      case AppStep.SCREEN_3: return <Screen3 onNext={nextStep} onBack={prevStep} />;
      case AppStep.SCREEN_4: return <Screen4 onNext={nextStep} onBack={prevStep} />;
      case AppStep.SCREEN_5: return <Screen5 onNext={nextStep} onBack={prevStep} />;
      case AppStep.SCREEN_6: return <Screen6 onBack={settingsMode ? goToProfile : prevStep} onFinish={settingsMode ? goToProfile : nextStep} sections={sections} setSections={setSections} isEditMode={settingsMode} />;
      case AppStep.SCREEN_7: return <Screen7 onBack={settingsMode ? goToProfile : prevStep} onFinish={settingsMode ? goToProfile : nextStep} debts={debts} setDebts={setDebts} isEditMode={settingsMode} />;
      
      // Update Screen8 to use custom finish handler that calculates initial balance
      case AppStep.SCREEN_8: return <Screen8 onBack={settingsMode ? goToProfile : prevStep} onFinish={handleFinishMethodsSetup} methods={methods} setMethods={setMethods} isEditMode={settingsMode} />;
      
      // Update Screen9 to go directly to Dashboard (SCREEN_11), skipping Screen 10 in the initial flow
      case AppStep.SCREEN_9: return <Screen9 onFinish={goToDashboard} categoriesCount={categoriesCount} debtsCount={debts.length} paymentMethodsCount={methods.length} />;
      
      // Screen 10 (Transaction) is now only accessed via the Dashboard (+) button
      case AppStep.SCREEN_10: return <Screen10 sections={sections} debts={debts} methods={methods} weeklyBalance={weeklyBalance} spentAmounts={spentAmounts} onClose={goToDashboard} onSave={handleSaveTransaction} showIntro={!hasSeenTransactionIntro} onIntroClosed={() => setHasSeenTransactionIntro(true)} texts={t} currency={currency} />;
      
      case AppStep.SCREEN_11: 
        return <Screen11 
            onAddTransaction={openAddTransaction} 
            weeklyBalance={weeklyBalance} 
            spentAmounts={spentAmounts} 
            debts={debts} 
            onGoToAnalysis={goToAnalysis} 
            onGoToCards={goToCards} 
            onGoToProfile={goToProfile} 
            texts={t} 
            currency={currency}
            notifications={notifications}
            onOpenNotifications={markAllNotificationsAsRead}
            onDismissNotification={handleDismissNotification}
        />;
      case AppStep.SCREEN_12: return <Screen12 weeklyBalance={weeklyBalance} spentAmounts={spentAmounts} debts={debts} methods={methods} onAddTransaction={openAddTransaction} onBackToBudget={goToDashboard} onViewDetailedAnalysis={goToDetailedAnalysis} onGoToCards={goToCards} onGoToProfile={goToProfile} currency={currency} />;
      case AppStep.SCREEN_12_1: return <Screen12_1 spentAmounts={spentAmounts} transactionCount={transactionCount} dateRange={dateRange} onBack={goToAnalysis} onOpenFilter={goToDateFilter} currency={currency} />;
      case AppStep.SCREEN_12_2: return <Screen12_2 onBack={goToDetailedAnalysis} onApply={handleDateFilterApply} initialStartDate={dateRange.startDate} initialEndDate={dateRange.endDate} selectionMode={analysisViewMode} />;
      case AppStep.SCREEN_13:
        return <Screen13 
           methods={methods}
           setMethods={setMethods}
           onSaveMethod={handleSaveMethod}
           transfers={internalTransfers}
           transactions={transactions}
           onTransfer={handleTransfer}
           onDeleteTransaction={handleDeleteTransaction}
           onDeleteTransfer={handleDeleteTransfer}
           onUpdateTransaction={handleUpdateTransaction}
           onBackToBudget={goToDashboard}
           onGoToAnalysis={goToAnalysis}
           onAddTransaction={openAddTransaction}
           onGoToProfile={goToProfile}
           currency={currency}
           notifications={notifications}
           onOpenNotifications={markAllNotificationsAsRead}
           onDismissNotification={handleDismissNotification}
        />;
      case AppStep.SCREEN_14: return <Screen14 onBackToBudget={goToDashboard} onGoToAnalysis={goToAnalysis} onGoToCards={goToCards} onAddTransaction={openAddTransaction} onNavigateToCategories={() => setStep(AppStep.SCREEN_6)} onNavigateToDebts={() => setStep(AppStep.SCREEN_7)} onNavigateToMethods={() => setStep(AppStep.SCREEN_8)} onExport={handleExportData} currentLanguage={language} onLanguageChange={setLanguage} currentCurrency={currency} onCurrencyChange={setCurrency} texts={t} onResetApp={handleResetApp} />;
      default: return <Screen1 onNext={nextStep} />;
    }
  };

  return (
    // Use 100dvh to respond to mobile browser keyboard appearing
    <div className="w-full h-[100dvh] bg-black flex items-center justify-center">
      <div className="w-full h-full sm:max-w-md sm:h-[90vh] sm:border sm:border-gray-800 sm:rounded-[3rem] overflow-hidden bg-black relative shadow-2xl">
        {/* Status Bar Mock */}
        <div className="absolute top-0 left-0 w-full h-6 z-50 flex justify-between px-6 items-center pt-2 sm:hidden">
            <span className="text-[10px] font-bold">9:41</span>
            <div className="flex gap-1">
                <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
            </div>
        </div>
        {renderStep()}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full mb-2 z-50 pointer-events-none"></div>
      </div>
    </div>
  );
}

export default App;