import React, {useState, useEffect} from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import {useHistory, useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

interface SearchResult {
  title: string;
  url: string;
  content: string;
  type: 'docs' | 'blog';
}

export default function SearchPage(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  const history = useHistory();
  const location = useLocation();
  const searchIndexUrl = useBaseUrl('/search-index.json');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchIndex, setSearchIndex] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load search index
  useEffect(() => {
    fetch(searchIndexUrl)
      .then((res) => res.json())
      .then((data) => {
        setSearchIndex(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load search index:', err);
        setIsLoading(false);
      });
  }, [searchIndexUrl]);

  // Get query parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    if (query && searchIndex.length > 0) {
      performSearch(query);
    }
  }, [location.search, searchIndex]);

  const performSearch = (query: string) => {
    if (!query.trim() || !searchIndex || searchIndex.length === 0) {
      setResults([]);
      return;
    }

    const queryLower = query.toLowerCase();
    const searchResults: SearchResult[] = [];
    const seenUrls = new Set<string>();

    // The search index is an array of items with structure: {t: text, s: section, u: url, h: heading, p: page}
    // First element might be metadata, so we skip it
    const items = Array.isArray(searchIndex) ? searchIndex : [];
    
    items.forEach((item: any) => {
      // Skip if it's the index metadata object
      if (item.index || typeof item !== 'object' || !item.t) {
        return;
      }

      const text = item.t || '';
      const section = item.s || '';
      const url = item.u || '';
      const heading = item.h || '';

      // Skip if we've already seen this URL
      const fullUrl = heading ? `${url}${heading}` : url;
      if (seenUrls.has(fullUrl)) {
        return;
      }

      const textMatch = text.toLowerCase().includes(queryLower);
      const sectionMatch = section.toLowerCase().includes(queryLower);
      
      if (textMatch || sectionMatch) {
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
      }
    });

    // Sort by relevance (section matches first, then by position in text)
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
      history.push(`/search?q=${encodeURIComponent(query)}`);
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
                  style={{marginLeft: '8px'}}>
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

