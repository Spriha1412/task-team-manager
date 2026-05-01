import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Folder,
  LayoutDashboard,
  ListTodo,
  Loader2,
  LogOut,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';

function getErrorMessage(err, fallback) {
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(', ');
  }
  return detail || fallback;
}

function statusLabel(status) {
  return status.replace('_', ' ');
}

export default function Dashboard({ token, setToken }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', project_id: '' });
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [formError, setFormError] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  const api = useMemo(
    () =>
      axios.create({
        baseURL: 'http://localhost:8000',
        headers: { Authorization: `Bearer ${token}` },
      }),
    [token],
  );

  const fetchData = useCallback(
    async () => {
      try {
        const [userRes, tasksRes, projectsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/tasks/'),
          api.get('/projects/'),
        ]);

        setUser(userRes.data);
        setTasks(tasksRes.data);
        setProjects(projectsRes.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          setToken(null);
        } else {
          setNotice({
            type: 'error',
            message: getErrorMessage(err, 'Unable to load dashboard data.'),
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [api, setToken],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial API load resolves before updating local dashboard state.
    fetchData();
  }, [fetchData]);

  const taskStats = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((task) => task.status === 'todo').length,
      inProgress: tasks.filter((task) => task.status === 'in_progress').length,
      done: tasks.filter((task) => task.status === 'done').length,
    }),
    [tasks],
  );

  const taskCountsByProject = useMemo(
    () =>
      tasks.reduce((counts, task) => {
        counts[task.project_id] = (counts[task.project_id] || 0) + 1;
        return counts;
      }, {}),
    [tasks],
  );

  const openProjectModal = () => {
    setFormError('');
    setNotice(null);
    setShowProjectModal(true);
  };

  const openTaskModal = () => {
    setFormError('');
    setNotice(null);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setFormError('');
    setShowTaskModal(false);
  };

  const closeProjectModal = () => {
    setFormError('');
    setShowProjectModal(false);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const payload = {
      title: newTask.title.trim(),
      description: newTask.description.trim() || null,
    };

    if (!payload.title || !newTask.project_id) {
      setFormError('Add a title and choose a project.');
      return;
    }

    setCreatingTask(true);
    setFormError('');
    try {
      const res = await api.post(`/tasks/project/${newTask.project_id}`, payload);
      setTasks((currentTasks) => [res.data, ...currentTasks]);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', project_id: '' });
      setNotice({ type: 'success', message: 'Task created.' });
      fetchData();
    } catch (err) {
      console.error(err);
      setFormError(getErrorMessage(err, 'Unable to create task.'));
    } finally {
      setCreatingTask(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const payload = {
      title: newProject.title.trim(),
      description: newProject.description.trim() || null,
    };

    if (!payload.title) {
      setFormError('Add a project title.');
      return;
    }

    setCreatingProject(true);
    setFormError('');
    try {
      const res = await api.post('/projects/', payload);
      setProjects((currentProjects) => [res.data, ...currentProjects]);
      setShowProjectModal(false);
      setNewProject({ title: '', description: '' });
      setNotice({ type: 'success', message: 'Project created.' });
      fetchData();
    } catch (err) {
      console.error(err);
      setFormError(getErrorMessage(err, 'Unable to create project.'));
    } finally {
      setCreatingProject(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}?status=${newStatus}`);
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? res.data : task)),
      );
      fetchData();
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', message: getErrorMessage(err, 'Unable to update task.') });
    }
  };

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <div className="dashboard-shell animate-fade-in">
      <header className="dashboard-topbar">
        <div className="brand-lockup">
          <span className="brand-icon">
            <CheckCircle2 size={24} />
          </span>
          <div>
            <h1>Team Task Manager</h1>
            <p>Project workspaces and task status in one clean view.</p>
          </div>
        </div>

        <div className="topbar-actions">
          {user && (
            <div className="user-pill">
              <ShieldCheck size={16} />
              <span>{user.username}</span>
              <strong>{user.role}</strong>
            </div>
          )}
          <button onClick={handleLogout} className="btn-secondary">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {notice && (
        <div className={`notice notice-${notice.type}`} role="status">
          {notice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notice.message}</span>
        </div>
      )}

      <main>
        <section className="dashboard-intro">
          <div>
            <p className="eyebrow">
              <LayoutDashboard size={16} /> Dashboard
            </p>
            <h2>Your Work Overview</h2>
            <p className="intro-copy">Workspace activity across projects and tasks.</p>
          </div>

          {user?.role === 'admin' && (
            <div className="action-row">
              <button className="btn-secondary" onClick={openProjectModal}>
                <Plus size={18} /> New Project
              </button>
              <button className="btn-primary" onClick={openTaskModal} disabled={!projects.length}>
                <Plus size={18} /> New Task
              </button>
            </div>
          )}
        </section>

        <section className="metric-grid" aria-label="Dashboard summary">
          <div className="metric-tile">
            <Folder size={20} />
            <span>Projects</span>
            <strong>{projects.length}</strong>
          </div>
          <div className="metric-tile">
            <ClipboardList size={20} />
            <span>Total Tasks</span>
            <strong>{taskStats.total}</strong>
          </div>
          <div className="metric-tile">
            <Clock size={20} />
            <span>In Progress</span>
            <strong>{taskStats.inProgress}</strong>
          </div>
          <div className="metric-tile">
            <CheckCircle2 size={20} />
            <span>Done</span>
            <strong>{taskStats.done}</strong>
          </div>
        </section>

        {isLoading ? (
          <div className="loading-panel">
            <Loader2 className="spin" size={28} />
            <span>Loading dashboard...</span>
          </div>
        ) : (
          <>
            <section className="section-block">
              <div className="section-heading">
                <div>
                  <h2>Projects</h2>
                  <p>{projects.length} active workspace{projects.length === 1 ? '' : 's'}</p>
                </div>
              </div>

              {projects.length ? (
                <div className="project-grid">
                  {projects.map((project) => (
                    <article key={project.id} className="project-card">
                      <div className="card-heading">
                        <span className="card-icon">
                          <Folder size={20} />
                        </span>
                        <span className="project-count">
                          {taskCountsByProject[project.id] || 0} task
                          {(taskCountsByProject[project.id] || 0) === 1 ? '' : 's'}
                        </span>
                      </div>
                      <h3>{project.title}</h3>
                      <p>{project.description || 'No description added.'}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Folder size={40} />
                  <h3>No projects yet.</h3>
                </div>
              )}
            </section>

            <section className="section-block">
              <div className="section-heading">
                <div>
                  <h2>Tasks</h2>
                  <p>
                    {taskStats.todo} todo, {taskStats.inProgress} in progress, {taskStats.done} done
                  </p>
                </div>
              </div>

              {tasks.length ? (
                <div className="task-grid">
                  {tasks.map((task) => {
                    const project = projects.find((p) => p.id === task.project_id);
                    return (
                      <article key={task.id} className="task-card">
                        <div className="task-card-top">
                          <h3>{task.title}</h3>
                          <span className={`badge badge-${task.status}`}>
                            {statusLabel(task.status)}
                          </span>
                        </div>
                        <p>{task.description || 'No description added.'}</p>
                        {project && (
                          <span className="project-link">
                            <Folder size={14} /> {project.title}
                          </span>
                        )}

                        <div className="status-actions">
                          {task.status !== 'todo' && (
                            <button
                              className="icon-text-button"
                              onClick={() => updateTaskStatus(task.id, 'todo')}
                            >
                              <ListTodo size={14} /> Todo
                            </button>
                          )}
                          {task.status !== 'in_progress' && (
                            <button
                              className="icon-text-button"
                              onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            >
                              <Clock size={14} /> Progress
                            </button>
                          )}
                          {task.status !== 'done' && (
                            <button
                              className="icon-text-button success-action"
                              onClick={() => updateTaskStatus(task.id, 'done')}
                            >
                              <CheckCircle2 size={14} /> Done
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <CheckCircle2 size={44} />
                  <h3>No tasks yet.</h3>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {showTaskModal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-panel animate-slide-up" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Task</p>
                <h2>Create New Task</h2>
              </div>
              <button className="icon-button" type="button" onClick={closeTaskModal} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="form-error">
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="form-stack">
              <label>
                <span>Project</span>
                <select
                  value={newTask.project_id}
                  onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={4}
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeTaskModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creatingTask}>
                  {creatingTask ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-panel animate-slide-up" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Project</p>
                <h2>Create New Project</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                onClick={closeProjectModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="form-error">
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="form-stack">
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  required
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={4}
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeProjectModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creatingProject}>
                  {creatingProject ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
