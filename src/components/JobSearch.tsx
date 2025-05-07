
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GaugeChart from './GaugeChart';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { fetchCSV, transformJobData } from '../utils/csvParser';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Job {
  title: string;
  impact: number;
  description?: string;
}

interface JobSearchProps {
  onJobSelect?: (job: Job) => void;
}

const JobSearch: React.FC<JobSearchProps> = ({ onJobSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  
  // Fetch job data on component mount
  useEffect(() => {
    const loadJobData = async () => {
      try {
        setIsLoading(true);
        const jobDataCSV = await fetchCSV('/data/job_data.csv');
        
        if (jobDataCSV.length === 0) {
          throw new Error('Failed to load job data or CSV is empty');
        }
        
        // Transform to simpler format for JobSearch component
        const jobs = jobDataCSV.map(job => ({
          title: job.title,
          impact: parseInt(job.impact),
          description: job.description || getExplanation(parseInt(job.impact))
        }));
        
        setAllJobs(jobs);
        setFilteredJobs(jobs);
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
  
  // Filter jobs based on search term
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredJobs(allJobs);
    } else {
      const filtered = allJobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, allJobs]);
  
  // Handle job selection
  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setOpen(false);
    if (onJobSelect) {
      onJobSelect(job);
    }
  };

  // Get explanation text based on impact percentage
  const getExplanation = (impact: number) => {
    if (impact < 30) {
      return "Low automation risk. This role requires human skills like creativity, empathy, or complex problem-solving that AI cannot easily replicate.";
    } else if (impact < 70) {
      return "Moderate automation risk. While some tasks may be automated, this role involves skills and responsibilities that still require human judgment.";
    } else {
      return "High automation risk. Many tasks in this role could be automated by AI systems in the coming years, potentially reducing demand.";
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="animate-pulse w-full">
          <div className="h-10 bg-gray-200 rounded mb-4 w-full"></div>
          <div className="h-64 bg-gray-100 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="job-search-container">
      <div className="search-box mb-8">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline" 
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-white border border-gray-300 hover:bg-gray-50"
            >
              {selectedJob ? selectedJob.title : "Search for your job title..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start" style={{ width: '350px' }}>
            <Command>
              <CommandInput 
                placeholder="Search job titles..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {filteredJobs.map((job) => (
                    <CommandItem
                      key={job.title}
                      onSelect={() => handleJobSelect(job)}
                    >
                      {job.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedJob && (
        <div className="job-results animate-fade-in">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative">
                <GaugeChart percentage={selectedJob.impact} />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="absolute top-0 right-0 text-gray-400 hover:text-gray-600">
                      <Info size={16} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-64 text-xs">
                        This gauge shows the AI impact score (0-100). Higher scores
                        indicate greater potential for automation or disruption.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="w-full md:w-1/2">
              <h3 className="text-2xl font-semibold mb-2 text-theme-primary">{selectedJob.title}</h3>
              
              <div className="impact-explanation mb-4">
                <h4 className="text-lg font-medium mb-1">AI Impact Assessment:</h4>
                <p className="text-gray-700">{selectedJob.description || getExplanation(selectedJob.impact)}</p>
              </div>
              
              <div className="risk-factors mb-4">
                <h4 className="text-lg font-medium mb-1">Key Factors:</h4>
                <ul className="list-disc pl-5 text-gray-700">
                  {selectedJob.impact > 60 && (
                    <>
                      <li>Tasks involve routine, predictable processes</li>
                      <li>Data-intensive work that can be automated</li>
                      <li>Limited need for creative or emotional intelligence</li>
                    </>
                  )}
                  {selectedJob.impact > 30 && selectedJob.impact <= 60 && (
                    <>
                      <li>Mix of routine and non-routine tasks</li>
                      <li>Some aspects require human judgment</li>
                      <li>AI will augment rather than replace</li>
                    </>
                  )}
                  {selectedJob.impact <= 30 && (
                    <>
                      <li>Requires high emotional intelligence or creativity</li>
                      <li>Complex problem-solving in unpredictable environments</li>
                      <li>Human connection is central to the role</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="recommendations">
                <h4 className="text-lg font-medium mb-1">Recommendations:</h4>
                <p className="text-gray-700">
                  {selectedJob.impact > 60 
                    ? "Consider upskilling in complementary areas or transitioning to roles that require more human judgment and creativity."
                    : selectedJob.impact > 30
                    ? "Focus on developing skills that complement AI capabilities, such as complex problem-solving and interpersonal communication."
                    : "Continue developing expertise in your field, while also learning to work alongside AI tools that can enhance your productivity."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSearch;
