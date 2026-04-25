"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Trash2, 
  ExternalLink, 
  Clock, 
  HardDrive, 
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
  MoreVertical,
  Link as LinkIcon,
  Tag,
  X
} from "lucide-react";
import { FileWithUsage, getFiles, deleteFile, bulkDeleteFiles } from "./actions";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

export default function FileManagerClient({ 
  initialData 
}: { 
  initialData: { files: FileWithUsage[], totalCount: number, totalPages: number, currentPage: number } 
}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "abandoned" | "linked">("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [viewingAllUsages, setViewingAllUsages] = useState<FileWithUsage | null>(null);

  const fetchFiles = async (p: number, f: typeof filter, s: string) => {
    setLoading(true);
    try {
      const res = await getFiles({ page: p, filter: f, search: s });
      setData(res);
      setSelectedIds(new Set()); // Reset selection on new fetch
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true); // Immediate feedback
    const timer = setTimeout(() => {
      fetchFiles(1, filter, search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filter]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data.files.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.files.map(f => f.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} files?`)) return;

    setIsBulkDeleting(true);
    try {
      const res = await bulkDeleteFiles(Array.from(selectedIds));
      if (res.success) {
        fetchFiles(page, filter, search);
      } else {
        alert("Bulk delete failed: " + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchFiles(newPage, filter, search);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file? This will remove it from the database.")) return;
    
    setDeletingId(id);
    try {
      const res = await deleteFile(id);
      if (res.success) {
        fetchFiles(page, filter, search);
      } else {
        alert("Failed to delete: " + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getUsageBadge = (type: string) => {
    switch (type) {
      case "LOGO": return "bg-blue-100 text-blue-700";
      case "MENU_IMAGE": return "bg-purple-100 text-purple-700";
      case "MEAL": return "bg-green-100 text-green-700";
      case "GLOBAL_MEAL": return "bg-amber-100 text-amber-700";
      case "LIBRARY": return "bg-gray-100 text-gray-700";
      case "ABANDONED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">File Manager</h1>
          <p className="text-gray-500 text-sm font-medium">Manage your storage assets and track their usage across the platform.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center space-x-3">
            <HardDrive className="w-5 h-5 text-indigo-600" />
            <div>
              <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Assets</span>
              <span className="text-lg font-black text-indigo-900 tracking-tighter">{data.totalCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search files by name..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <button 
            onClick={toggleSelectAll}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedIds.size > 0 ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
          >
            {selectedIds.size === data.files.length ? "Deselect All" : "Select All Page"}
          </button>
          <div className="w-px h-6 bg-gray-200 mx-2 hidden lg:block" />
          <button 
            onClick={() => setFilter("all")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filter === "all" ? "bg-gray-900 text-white shadow-lg" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
          >
            All Files
          </button>
          <button 
            onClick={() => setFilter("linked")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filter === "linked" ? "bg-green-600 text-white shadow-lg" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
          >
            Linked
          </button>
          <button 
            onClick={() => setFilter("abandoned")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filter === "abandoned" ? "bg-red-600 text-white shadow-lg" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
          >
            Abandoned
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-3xl">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <span className="text-sm font-black text-gray-900 uppercase tracking-widest animate-pulse">Refreshing Data...</span>
            </div>
          </div>
        )}

        {data.files.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-dashed border-gray-200 py-24 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <ImageIcon className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">No files found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.files.map((file) => (
              <div 
                key={file.id} 
                onClick={() => toggleSelect(file.id)}
                className={`group cursor-pointer bg-white rounded-[32px] border transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100 overflow-hidden flex flex-col ${selectedIds.has(file.id) ? "border-indigo-600 ring-2 ring-indigo-600/20 shadow-xl" : file.isAbandoned ? "border-red-100" : "border-gray-100"}`}
              >
                {/* Preview */}
                <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                  <img 
                    src={file.url} 
                    alt={file.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Selection Overlay */}
                  <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedIds.has(file.id) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-black/20 border-white/40 text-transparent"}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>

                  {file.isAbandoned && !selectedIds.has(file.id) && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1 shadow-lg shadow-red-200">
                      <AlertCircle className="w-3 h-3" />
                      <span>Abandoned</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); window.open(file.url, "_blank"); }}
                      className="p-3 bg-white rounded-2xl text-gray-900 hover:bg-gray-50 transition-all hover:scale-110"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                      disabled={deletingId === file.id}
                      className="p-3 bg-red-600 rounded-2xl text-white hover:bg-red-700 transition-all hover:scale-110 disabled:opacity-50"
                    >
                      {deletingId === file.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col flex-1 mr-2 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate" title={file.filename}>
                        {file.filename}
                      </h3>
                      <span className="text-[9px] font-mono text-gray-400">ID: {file.id}</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg uppercase tracking-widest shrink-0">
                      {file.extension}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                      <div className="flex items-center space-x-1.5">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{formatSize(file.size)}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>

                    {/* Usage Tags */}
                    <div className="space-y-1.5 pt-3 border-t border-gray-50">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center space-x-1.5 mb-2">
                        <Tag className="w-3 h-3" />
                        <span>Used In</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {file.usages.slice(0, 3).map((usage, idx) => (
                          <div 
                            key={idx} 
                            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-bold ${getUsageBadge(usage.type)}`}
                          >
                            <LinkIcon className="w-2.5 h-2.5" />
                            <span>{usage.type} {usage.entityName ? `• ${usage.entityName}` : ""}</span>
                          </div>
                        ))}
                        {file.usages.length > 3 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setViewingAllUsages(file); }}
                            className="px-2 py-1 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors"
                          >
                            +{file.usages.length - 3} More
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-8 pb-20">
          <button 
            disabled={page === 1 || loading}
            onClick={() => handlePageChange(page - 1)}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <span className="text-sm font-black text-gray-900 uppercase tracking-widest">
              Page {page} of {data.totalPages}
            </span>
          </div>

          <button 
            disabled={page === data.totalPages || loading}
            onClick={() => handlePageChange(page + 1)}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-[32px] shadow-2xl flex items-center space-x-8 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
                <span className="text-lg font-black">{selectedIds.size}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Files Selected</span>
                <span className="text-[10px] font-medium text-gray-500">Ready for bulk action</span>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 shadow-lg shadow-red-900/20 disabled:opacity-50"
              >
                {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Usages Modal */}
      {viewingAllUsages && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setViewingAllUsages(null)}
          />
          
          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Usage Details</h3>
                <p className="text-xs font-medium text-gray-500 mt-1">Full list of entities using this image.</p>
              </div>
              <button 
                onClick={() => setViewingAllUsages(null)}
                className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 shrink-0">
                <img src={viewingAllUsages.url} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate text-sm">{viewingAllUsages.filename}</p>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">
                  {viewingAllUsages.usages.length} Total Relations
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] p-6 space-y-3">
              {viewingAllUsages.usages.map((usage, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-4 rounded-2xl border border-gray-100 ${getUsageBadge(usage.type)} bg-opacity-10`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${getUsageBadge(usage.type)}`}>
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest opacity-60">{usage.type}</span>
                      <span className="text-sm font-bold block">{usage.entityName || "Unknown Entity"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => setViewingAllUsages(null)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
