import React, {useState, useEffect, useRef} from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import {useHistory, useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
// @ts-ignore
import FlexSearch from 'flexsearch';

interface SearchResult {
  title: string;
  url: string;
  content: string;
  type: 'docs' | 'blog';
}

export default function SearchResultsPage(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  const history = useHistory();
  const location = useLocation();
  const searchIndexUrl = useBaseUrl('/search-index.json');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchIndexData, setSearchIndexData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchIndexRef = useRef<any>(null);

  // Load search index
  useEffect(() => {
    fetch(searchIndexUrl)
      .then((res) => res.json())
      .then((data) => {
        setSearchIndexData(data);
        
        // Initialize FlexSearch index
        if (data && Array.isArray(data) && data.length > 0) {
          // The last element contains documents and index
          const lastElement = data[data.length - 1];
          const indexData = lastElement?.index;
          const documents = lastElement?.documents || data.slice(0, -1);
          
          if (indexData && documents) {
            // Create a FlexSearch Index matching the plugin's configuration
            // The plugin uses a simple Index with 't' (text) field
            const index = new FlexSearch.Index({
              preset: indexData.pipeline?.includes('stemmer') ? 'default' : 'performance',
              tokenize: 'forward',
            });
            
            // Import the pre-built index
            index.import(indexData);
            
            searchIndexRef.current = {index, documents};
          }
        }
        
        setIsLoading(false);
        
        // If there's a query in the URL, perform search after loading
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        if (query && searchIndexRef.current) {
          performSearch(query);
        }
      })
      .catch((err) => {
        console.error('Failed to load search index:', err);
        setIsLoading(false);
      });
  }, [searchIndexUrl]);

  // Get query parameter from URL and perform search when query changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    if (query && searchIndexRef.current && !isLoading) {
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = (query: string) => {
    if (!query.trim() || !searchIndexRef.current) {
      setResults([]);
      return;
    }

    const {index, documents} = searchIndexRef.current;
    if (!documents || documents.length === 0) {
      console.warn('No documents available for search');
      setResults([]);
      return;
    }

    const queryLower = query.toLowerCase();
    const searchResults: SearchResult[] = [];
    const seenUrls = new Set<string>();

    try {
      // Try FlexSearch first
      let resultIds: number[] = [];
      try {
        if (index && typeof index.search === 'function') {
          const searchResultsIds = index.search(query, {
            limit: 50,
          });
          resultIds = Array.isArray(searchResultsIds) ? searchResultsIds : [searchResultsIds];
        }
      } catch (flexError) {
        console.warn('FlexSearch failed, using fallback:', flexError);
      }

      // Always use fallback text search (more reliable)
      // This ensures we get results even if FlexSearch doesn't work
      documents.forEach((doc: any) => {
        if (!doc || !doc.t) return;
        const text = (doc.t || '').toLowerCase();
        const section = (doc.s || '').toLowerCase();
        const url = (doc.u || '').toLowerCase();
        if (text.includes(queryLower) || section.includes(queryLower) || url.includes(queryLower)) {
          if (!resultIds.includes(doc.i)) {
            resultIds.push(doc.i);
          }
        }
      });
      
      // Map results back to documents
      resultIds.forEach((id: number) => {
        const doc = documents.find((d: any) => d.i === id);
        if (!doc || !doc.t) return;

        const text = doc.t || '';
        const section = doc.s || '';
        const url = doc.u || '';
        const heading = doc.h || '';

        // Create unique URL
        const fullUrl = heading ? `${url}${heading}` : url;
        if (seenUrls.has(fullUrl)) {
          return;
        }
        seenUrls.add(fullUrl);

        // Extract snippet from text
        const snippetStart = text.toLowerCase().indexOf(queryLower);
        const snippet = snippetStart >= 0
          ? text.substring(Math.max(0, snippetStart - 50), snippetStart + 150)
          : text.substring(0, 200);

        // Determine type from URL
        const type = url.startsWith('/blog') ? 'blog' : 'docs';

        searchResults.push({
          title: section || 'Untitled',
          url: fullUrl,
          content: snippet,
          type: type,
        });
      });
    } catch (error) {
      console.error('Search error:', error);
      // Final fallback: simple text search on all documents
      documents.forEach((doc: any) => {
        const text = (doc.t || '').toLowerCase();
        const section = (doc.s || '').toLowerCase();
        if (text.includes(queryLower) || section.includes(queryLower)) {
          const url = doc.u || '';
          const heading = doc.h || '';
          const fullUrl = heading ? `${url}${heading}` : url;
          
          if (!seenUrls.has(fullUrl)) {
            seenUrls.add(fullUrl);
            const snippetStart = text.indexOf(queryLower);
            const snippet = snippetStart >= 0
              ? doc.t.substring(Math.max(0, snippetStart - 50), snippetStart + 150)
              : doc.t.substring(0, 200);
            
            searchResults.push({
              title: doc.s || 'Untitled',
              url: fullUrl,
              content: snippet,
              type: url.startsWith('/blog') ? 'blog' : 'docs',
            });
          }
        }
      });
    }

    // Sort by relevance (section matches first)
    searchResults.sort((a, b) => {
      const aSectionMatch = a.title.toLowerCase().includes(queryLower);
      const bSectionMatch = b.title.toLowerCase().includes(queryLower);
      if (aSectionMatch && !bSectionMatch) return -1;
      if (!aSectionMatch && bSectionMatch) return 1;
      return 0;
    });

    setResults(searchResults);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      history.push(`/search-results?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Layout
      title={`Search - ${siteConfig.title}`}
      description="Search the documentation">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <h1>Search</h1>
            <form onSubmit={handleSearch} className="margin-bottom--lg">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="button button--primary"
                  style={{marginLeft: '8px'}}
                >
                  Search
                </button>
              </div>
            </form>

            {searchQuery && (
              <div>
                <p className="margin-bottom--md">
                  {results.length > 0
                    ? `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${searchQuery}"`
                    : `No results found for "${searchQuery}"`}
                </p>

                {results.length > 0 && (
                  <div className="search-results">
                    {results.map((result, index) => (
                      <div key={index} className="card margin-bottom--md">
                        <div className="card__header">
                          <Link to={result.url}>
                            <h3>{result.title}</h3>
                          </Link>
                          <span className="badge badge--secondary margin-left--sm">
                            {result.type}
                          </span>
                        </div>
                        <div className="card__body">
                          <p>{result.content}...</p>
                          <Link to={result.url} className="button button--link">
                            Read more →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!searchQuery && (
              <div className="margin-top--lg">
                <p>Enter a search term in the box above to search the documentation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

