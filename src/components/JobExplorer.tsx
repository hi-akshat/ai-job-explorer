import React, { useState, useEffect, useMemo } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import GaugeChart from './GaugeChart';
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronUp, Filter, ArrowUpDown, Info } from 'lucide-react';
import RadarChart from './RadarChart';
import { fetchCSV, transformJobData } from '../utils/csvParser';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define Job interface (importing from data file would create circular dependency)
interface Job {
  title: string;
  impact: number;
  tasks: number;
  aiModels: number;
  aiWorkloadRatio: number;
  domain: string;
  keySkillsToKeep: string[];
  howToBeAIProof: string;
  timeToDisruption: string;
  aiImpactAssessment: string;
}

interface JobExplorerProps {
  onJobSelect?: (job: Job) => void;
}

const JobExplorer: React.FC<JobExplorerProps> = ({ onJobSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'impact' | 'title' | 'aiWorkloadRatio'>('impact');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch job data from CSV on component mount
  useEffect(() => {
    const loadJobData = async () => {
      try {
        setIsLoading(true);
        const jobDataCSV = await fetchCSV('/data/augmented_final_data.csv');
        
        if (jobDataCSV.length === 0) {
          throw new Error('Failed to load job data or CSV is empty');
        }
        
        const transformedData = transformJobData(jobDataCSV);
        setAllJobs(transformedData);
        setFilteredJobs(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error loading job data:', err);
        setError('Failed to load job data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJobData();
  }, []);
  
  // Get unique domains for filtering
  const domains = useMemo(() => {
    if (allJobs.length === 0) return [];
    return Array.from(new Set(allJobs.map(job => job.domain)));
  }, [allJobs]);
  
  // Filter and sort jobs
  useEffect(() => {
    let filtered = [...allJobs];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply domain filter
    if (domainFilter) {
      filtered = filtered.filter(job => job.domain === domainFilter);
    }
    
    // Apply impact filter
    if (impactFilter !== 'all') {
      filtered = filtered.filter(job => {
        if (impactFilter === 'high') return job.impact >= 70;
        if (impactFilter === 'medium') return job.impact >= 30 && job.impact < 70;
        if (impactFilter === 'low') return job.impact < 30;
        return true;
      });
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'impact') {
        return sortDirection === 'asc' ? a.impact - b.impact : b.impact - a.impact;
      } else if (sortBy === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      } else if (sortBy === 'aiWorkloadRatio') {
        return sortDirection === 'asc' 
          ? a.aiWorkloadRatio - b.aiWorkloadRatio 
          : b.aiWorkloadRatio - a.aiWorkloadRatio;
      }
      return 0;
    });
    
    setFilteredJobs(filtered);
  }, [searchTerm, domainFilter, impactFilter, sortBy, sortDirection, allJobs]);
  
  // Handle job selection
  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setOpen(false);
    
    if (onJobSelect) {
      onJobSelect(job);
    }
    
    // Scroll to results if not in view
    const resultsElement = document.getElementById('job-results');
    if (resultsElement && !isInViewport(resultsElement)) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check if element is in viewport
  const isInViewport = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  // Toggle sort direction
  const toggleSort = (field: 'impact' | 'title' | 'aiWorkloadRatio') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Get explanation text based on impact percentage
  const getExplanation = (impact: number) => {
    if (impact < 30) {
      return "Low automation risk. This role requires human skills like creativity, empathy, or complex problem-solving that AI cannot easily replicate.";
    } else if (impact < 70) {
      return "Moderate automation risk. While some tasks may be automated, this role involves skills and responsibilities that still require human judgment and intervention.";
    } else {
      return "High automation risk. Many tasks in this role could be automated by AI systems in the coming years, potentially reducing demand for this position.";
    }
  };

  // Transform skills for radar chart
  const prepareSkillsData = () => {
    if (!selectedJob) return [];
    
    const automationLevel = selectedJob.impact >= 70 ? 'High' : selectedJob.impact >= 30 ? 'Medium' : 'Low';
    
    return [
      { 
        skill: "Technical Knowledge", 
        value: Math.max(30, 100 - selectedJob.impact * 0.7),
        category: "Human Skills"
      },
      { 
        skill: "Creative Problem Solving", 
        value: Math.max(40, 110 - selectedJob.impact * 0.8),
        category: "Human Skills"
      },
      { 
        skill: "Emotional Intelligence", 
        value: Math.max(50, 120 - selectedJob.impact * 0.9),
        category: "Human Skills"
      },
      { 
        skill: "Data Processing", 
        value: Math.min(90, 40 + selectedJob.impact * 0.6),
        category: "AI Capabilities"
      },
      { 
        skill: "Pattern Recognition", 
        value: Math.min(95, 35 + selectedJob.impact * 0.7),
        category: "AI Capabilities"  
      },
      { 
        skill: "Decision Making", 
        value: Math.min(85, 25 + selectedJob.impact * 0.7),
        category: "AI Capabilities"
      }
    ];
  };
  
  // Convert skills data for radar chart
  const radarData = useMemo(() => {
    const skillsData = prepareSkillsData();
    return skillsData.reduce((acc: any[], curr) => {
      const existingIndex = acc.findIndex(item => item.skill === curr.skill);
      if (existingIndex === -1) {
        acc.push({ skill: curr.skill, [curr.category]: curr.value });
      } else {
        acc[existingIndex][curr.category] = curr.value;
      }
      return acc;
    }, []);
  }, [selectedJob]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <p className="mt-4 text-gray-500">Loading job data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-explorer-container max-w-5xl mx-auto">
      {/* Search and filters */}
      <div className="search-box mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline" 
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-white border border-gray-300 hover:bg-gray-50 h-12 text-base"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <span className={selectedJob ? 'text-black' : 'text-gray-500'}>
                    {selectedJob ? selectedJob.title : "Search for your job title..."}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" style={{ width: '100%', maxWidth: '600px' }}>
              <Command className="w-full">
                <CommandInput 
                  placeholder="Type a job title..." 
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  className="h-12 text-base"
                />
                <CommandList>
                  <CommandEmpty className="py-6 text-center text-gray-500">
                    No jobs found. Try a different search term.
                  </CommandEmpty>
                  <CommandGroup className="overflow-y-auto max-h-72">
                    {filteredJobs.map((job) => (
                      <CommandItem
                        key={job.title}
                        onSelect={() => handleJobSelect(job)}
                        className="cursor-pointer py-3"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-medium">{job.title}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.impact >= 70 ? 'bg-red-100 text-red-800' : 
                            job.impact >= 30 ? 'bg-amber-100 text-amber-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {job.impact}% Impact
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 w-12 bg-white hover:bg-gray-50"
          >
            <Filter className={`w-4 h-4 ${showFilters ? 'text-indigo-600' : 'text-gray-500'}`} />
          </Button>
        </div>
        
        {/* Filters section */}
        {showFilters && (
          <div className="filters-section bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Domain filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                <select 
                  className="w-full rounded-md border border-gray-300 py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={domainFilter || ''}
                  onChange={(e) => setDomainFilter(e.target.value || null)}
                >
                  <option value="">All Domains</option>
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
              
              {/* Impact filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AI Impact Level</label>
                <select 
                  className="w-full rounded-md border border-gray-300 py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={impactFilter}
                  onChange={(e) => setImpactFilter(e.target.value as any)}
                >
                  <option value="all">All Impact Levels</option>
                  <option value="high">High Risk (70-100%)</option>
                  <option value="medium">Medium Risk (30-69%)</option>
                  <option value="low">Low Risk (0-29%)</option>
                </select>
              </div>
              
              {/* Sort options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <div className="flex space-x-2">
                  <Button 
                    variant={sortBy === 'impact' ? "default" : "outline"} 
                    onClick={() => toggleSort('impact')}
                    className="flex-1 flex justify-center items-center"
                    size="sm"
                  >
                    Impact {sortBy === 'impact' && (
                      sortDirection === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button 
                    variant={sortBy === 'title' ? "default" : "outline"} 
                    onClick={() => toggleSort('title')}
                    className="flex-1 flex justify-center items-center"
                    size="sm"
                  >
                    Name {sortBy === 'title' && (
                      sortDirection === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </Button>

                  <Button 
                    variant={sortBy === 'aiWorkloadRatio' ? "default" : "outline"} 
                    onClick={() => toggleSort('aiWorkloadRatio')}
                    className="flex-1 flex justify-center items-center"
                    size="sm"
                  >
                    AI Workload {sortBy === 'aiWorkloadRatio' && (
                      sortDirection === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Filter stats */}
            <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
              <span>{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found</span>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setDomainFilter(null);
                  setImpactFilter('all');
                  setSortBy('impact');
                  setSortDirection('desc');
                  setSearchTerm('');
                }}
                className="text-xs"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Job results */}
      {selectedJob && (
        <div id="job-results" className="job-results animate-scale-in">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className={`w-full h-2 ${
              selectedJob.impact >= 70 ? 'bg-gradient-to-r from-red-400 to-red-600' : 
              selectedJob.impact >= 30 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 
              'bg-gradient-to-r from-emerald-400 to-emerald-600'
            }`}></div>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-full md:w-1/2 flex flex-col items-center">
                  <div className="relative">
                    <GaugeChart percentage={selectedJob.impact} size={240} />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="absolute top-0 right-0 text-gray-400 hover:text-gray-600">
                          <Info size={18} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-64 text-sm">
                            This gauge shows the AI impact score (0-100). Higher scores
                            indicate greater potential for automation or disruption by AI.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-sm text-gray-500">Time to Disruption:</span>
                      <span className="text-sm font-semibold">{selectedJob.timeToDisruption}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-600">{selectedJob.tasks}</div>
                        <div className="text-sm text-gray-500">Tasks Analyzed</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-600">{selectedJob.aiModels}</div>
                        <div className="text-sm text-gray-500">AI Models</div>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-600">
                          {(selectedJob.aiWorkloadRatio * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">AI Workload Ratio</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2">
                  <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    {selectedJob.title}
                  </h2>
                  <div className="text-sm font-medium text-indigo-600 mb-4">{selectedJob.domain}</div>
                  
                  <div className="impact-explanation mb-6">
                    <h4 className="text-lg font-medium mb-2">AI Impact Assessment:</h4>
                    <p className="text-gray-700">{selectedJob.aiImpactAssessment}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-2">Key Skills to Maintain:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.keySkillsToKeep.map((skill, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="recommendations">
                    <h4 className="text-lg font-medium mb-2">How to Be AI-Proof:</h4>
                    <p className="text-gray-700">
                      {selectedJob.howToBeAIProof}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Skills comparison chart */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-center">Human vs AI Skills Comparison</h3>
                <div className="h-[300px]">
                  <RadarChart 
                    data={radarData}
                    keys={["Human Skills", "AI Capabilities"]}
                    indexBy="skill"
                    colors={["#9381FF", "#F87171"]}
                  />
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                  This chart compares human skills versus AI capabilities for this role
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobExplorer;
