import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import WorkspaceList from '../WorkspaceList'; // Adjust path as necessary
import { Workspace } from '../../lib/queries/workspaceQueries'; // Adjust path

// Mock the workspaceQueries module
vi.mock('../../lib/queries/workspaceQueries', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/queries/workspaceQueries')>();
  return {
    ...actual,
    useWorkspaces: vi.fn(),
    // Mock useCreateWorkspace as it's used in the component, though not directly tested for mutation here
    useCreateWorkspace: vi.fn(() => ({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isPending: false,
        isError: false,
    })),
  };
});

// Helper to get the mocked hook
// Vitest's vi.mocked utility can sometimes be tricky with module factory mocks,
// so direct casting might be more straightforward here if issues arise.
const mockedUseWorkspaces = vi.mocked(
  (await import('../../lib/queries/workspaceQueries')).useWorkspaces // Await import for dynamic mock
);


describe('WorkspaceList', () => {
  const mockOnSelectWorkspace = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockedUseWorkspaces.mockClear();
    mockOnSelectWorkspace.mockClear();
    // Reset create workspace mock if needed, though not directly tested here
    const createWorkspaceMock = (vi.mocked(
        (await import('../../lib/queries/workspaceQueries')).useCreateWorkspace
    )());
    createWorkspaceMock.mutateAsync.mockClear();
  });

  test('renders loading state correctly', () => {
    mockedUseWorkspaces.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any); // Cast as any to satisfy hook return type for partial mock

    render(<WorkspaceList selectedWorkspaceId={null} onSelectWorkspace={mockOnSelectWorkspace} />);
    expect(screen.getByText(/Loading workspaces.../i)).toBeInTheDocument();
  });

  test('renders error state correctly', () => {
    mockedUseWorkspaces.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch'),
    } as any);

    render(<WorkspaceList selectedWorkspaceId={null} onSelectWorkspace={mockOnSelectWorkspace} />);
    expect(screen.getByText(/Error fetching workspaces: Failed to fetch/i)).toBeInTheDocument();
  });

  test('renders list of workspaces and "Create New Workspace" button', () => {
    const mockData: Workspace[] = [
      { id: '1', name: 'My Workspace 1', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
      { id: '2', name: 'My Workspace 2', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
    ];
    mockedUseWorkspaces.mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<WorkspaceList selectedWorkspaceId="1" onSelectWorkspace={mockOnSelectWorkspace} />);
    
    expect(screen.getByText('My Workspace 1')).toBeInTheDocument();
    expect(screen.getByText('My Workspace 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create New Workspace/i })).toBeInTheDocument();
  });

  test('renders "No workspaces found" when data is empty', () => {
    mockedUseWorkspaces.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<WorkspaceList selectedWorkspaceId={null} onSelectWorkspace={mockOnSelectWorkspace} />);
    expect(screen.getByText(/No workspaces found/i)).toBeInTheDocument();
  });

  test('calls onSelectWorkspace when a workspace is clicked', () => {
    const mockData: Workspace[] = [
      { id: 'ws1', name: 'Clickable Workspace', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
    ];
    mockedUseWorkspaces.mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<WorkspaceList selectedWorkspaceId={null} onSelectWorkspace={mockOnSelectWorkspace} />);
    
    const workspaceItem = screen.getByText('Clickable Workspace');
    fireEvent.click(workspaceItem);
    
    expect(mockOnSelectWorkspace).toHaveBeenCalledWith('ws1');
  });

  test('shows create workspace form when "Create New Workspace" is clicked', () => {
    mockedUseWorkspaces.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);
      
    render(<WorkspaceList selectedWorkspaceId={null} onSelectWorkspace={mockOnSelectWorkspace} />);
    
    const createButton = screen.getByRole('button', { name: /Create New Workspace/i });
    fireEvent.click(createButton);
    
    expect(screen.getByRole('heading', { name: /New Workspace/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument(); // Create button in form
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument(); // Main button text changes to Cancel
  });
});
