"use client";
import { useState } from "react";
import {
  PencilSquareIcon,
  CheckCircleIcon,
  BanknotesIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface WorkflowStepsProps {
  statusCounts: {
    pending_confirmation: number;
    confirmed: number;
    paid: number;
    cancelled: number;
  };
}

export default function WorkflowSteps({ statusCounts }: WorkflowStepsProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  const steps = [
    {
      id: "pending_confirmation",
      icon: PencilSquareIcon,
      label: "Đặt chỗ",
      count: statusCounts.pending_confirmation,
      color: "yellow",
      bgColor: "from-yellow-500 to-orange-500",
      hoverColor: "yellow-600",
      shadowColor: "yellow-500/25"
    },
    {
      id: "confirmed",
      icon: CheckCircleIcon,
      label: "Xác nhận",
      count: statusCounts.confirmed,
      color: "blue",
      bgColor: "from-blue-500 to-cyan-500",
      hoverColor: "blue-600",
      shadowColor: "blue-500/25"
    },
    {
      id: "paid",
      icon: BanknotesIcon,
      label: "Thanh toán",
      count: statusCounts.paid,
      color: "green",
      bgColor: "from-green-500 to-emerald-500",
      hoverColor: "green-600",
      shadowColor: "green-500/25"
    },
    {
      id: "completed",
      icon: CheckCircleIcon,
      label: "Hoàn thành",
      count: 0,
      color: "purple",
      bgColor: "from-purple-500 to-pink-500",
      hoverColor: "purple-600",
      shadowColor: "purple-500/25"
    }
  ];

  const handleStepClick = (stepId: string) => {
    setActiveStep(stepId);
    // Scroll to table and highlight filtered rows
    const tableElement = document.getElementById('bookings-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Highlight rows with matching status
    setTimeout(() => {
      const rows = document.querySelectorAll('#bookings-table tbody tr');
      rows.forEach((row) => {
        const statusElement = row.querySelector('td:nth-child(5) span');
        if (statusElement) {
          const statusText = statusElement.textContent?.toLowerCase();
          if (statusText?.includes(stepId.replace('_', ' ')) || 
              (stepId === 'pending_confirmation' && statusText?.includes('chờ')) ||
              (stepId === 'confirmed' && statusText?.includes('xác nhận')) ||
              (stepId === 'paid' && statusText?.includes('thanh toán')) ||
              (stepId === 'cancelled' && statusText?.includes('hủy'))) {
            row.classList.add('bg-blue-50', 'border-l-4', 'border-blue-500');
          } else {
            row.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-500');
          }
        }
      });
    }, 100);
  };

  const handleQuickAction = (status: string) => {
    setActiveStep(status);
    handleStepClick(status);
  };

  return (
    <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Quy trình xử lý đặt tour</h2>
      </div>
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button 
              onClick={() => handleStepClick(step.id)}
              className={`group flex flex-col items-center hover:scale-105 transition-all duration-300 ${
                activeStep === step.id ? 'scale-105' : ''
              }`}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${step.bgColor} rounded-full flex items-center justify-center mb-2 text-white group-hover:shadow-lg group-hover:shadow-${step.shadowColor} transition-all duration-300 ${
                activeStep === step.id ? `shadow-lg shadow-${step.shadowColor}` : ''
              }`}>
                <step.icon className="h-8 w-8" />
              </div>
              <p className={`text-sm font-medium transition-colors ${
                activeStep === step.id ? `text-${step.hoverColor}` : 'text-gray-700 group-hover:text-' + step.hoverColor
              }`}>
                {step.label}
              </p>
              <span className="text-xs text-gray-500 mt-1">({step.count} đơn)</span>
            </button>
            
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 bg-gray-300 mx-4 relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${step.bgColor} to-${steps[index + 1].bgColor.split(' ')[1]} rounded-full`}></div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Thao tác nhanh</h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => handleQuickAction('pending_confirmation')}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <PencilSquareIcon className="h-4 w-4" />
            Xem đơn chờ xác nhận ({statusCounts.pending_confirmation})
          </button>
          <button 
            onClick={() => handleQuickAction('confirmed')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <CheckCircleIcon className="h-4 w-4" />
            Xem đơn đã xác nhận ({statusCounts.confirmed})
          </button>
          <button 
            onClick={() => handleQuickAction('paid')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <BanknotesIcon className="h-4 w-4" />
            Xem đơn đã thanh toán ({statusCounts.paid})
          </button>
          <button 
            onClick={() => handleQuickAction('cancelled')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <XCircleIcon className="h-4 w-4" />
            Xem đơn đã hủy ({statusCounts.cancelled})
          </button>
        </div>
      </div>
    </div>
  );
}
