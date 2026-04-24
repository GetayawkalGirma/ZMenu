import prisma from "@/lib/prisma";
import { FeedbackStatus, FeedbackType } from "@prisma/client";
import { 
  Badge, 
  Button, 
  Card 
} from "@/components/ui";
import { 
  MessageSquare, 
  Check, 
  X, 
  Clock, 
  Utensils, 
  Camera,
  Store,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import { FeedbackRow } from "./FeedbackRow";

export const revalidate = 0;

export default async function FeedbackModerationPage() {
  const feedbacks = await prisma.userFeedback.findMany({
    where: {
      status: FeedbackStatus.PENDING
    },
    include: {
      restaurant: true,
      restaurantMenu: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 mb-3">
              <MessageSquare className="w-3 h-3" />
              <span>Moderation Queue</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
              User Feedback
            </h1>
            <p className="text-gray-500 font-medium italic mt-1">
              Review and approve community-submitted updates.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending</span>
              <span className="text-2xl font-black text-amber-500">{feedbacks.length}</span>
            </div>
          </div>
        </header>

        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Queue is Clear</h3>
            <p className="text-gray-400 font-medium mt-2 italic">No pending feedback to review at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {feedbacks.map((feedback) => (
              <FeedbackRow key={feedback.id} feedback={feedback as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
