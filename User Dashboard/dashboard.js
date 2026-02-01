import { 
    auth, 
    db, 
    onAuthStateChanged,
    collection,
    deleteDoc,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp,
    signOut
} from "../Firebase/config.js";

let uid = null;
let userEmail = null;
let allPosts = [];
let userData = null;

const addBtn = document.getElementById("addBtn");
const logoutBtn = document.getElementById("logoutBtn");
const postsContainer = document.getElementById("posts");
const emptyState = document.getElementById("emptyState");
const totalTasks = document.getElementById("totalTasks");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");
const todayTasks = document.getElementById("todayTasks");
const streakCount = document.getElementById("streakCount");
const completionRate = document.getElementById("completionRate");
const currentDate = document.getElementById("currentDate");
const searchTask = document.getElementById("searchTask");
const filterSelect = document.getElementById("filterSelect");
const clearAllBtn = document.getElementById("clearAllBtn");
const markAllBtn = document.getElementById("markAllBtn");
const sortBtn = document.getElementById("sortBtn");
const addFirstBtn = document.getElementById("addFirstBtn");
const userName = document.getElementById("userName");
const taskInput = document.getElementById("task");

logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Logged out successfully!",
            showConfirmButton: false,
            timer: 2000
        });
        setTimeout(() => {
            window.location.href = "../login/login.html";
        }, 1500);
    } catch (error) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title: "Logout failed!",
            text: error.message,
            showConfirmButton: false,
            timer: 3000
        });
    }
});

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "../login/login.html";
        return;
    }

    uid = user.uid;
    userEmail = user.email;
    userName.textContent = user.displayName || user.email.split('@')[0];
    
    await loadUserData();
    await loadPosts();
    setCurrentDate();
});

async function loadUserData() {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                userData = doc.data();
            });
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

function setCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
}

async function loadPosts() {
    postsContainer.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading your tasks...</p>
        </div>
    `;

    const q = query(
        collection(db, "posts"), 
        where("uid", "==", uid), 
        orderBy("createdAt", "desc")
    );

    try {
        const snap = await getDocs(q);
        allPosts = [];
        
        snap.forEach((p) => {
            const data = p.data();
            allPosts.push({
                id: p.id,
                text: data.text,
                completed: data.completed || false,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            });
        });

        updateStatistics();
        renderPosts(allPosts);
        
    } catch (error) {
        console.error("Error loading posts:", error);
        postsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Tasks</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

function renderPosts(posts) {
    postsContainer.innerHTML = "";

    if (posts.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    posts.forEach((post) => {
        const taskCard = document.createElement("div");
        taskCard.className = "task-card";
        
        const taskContent = document.createElement("div");
        taskContent.className = "task-content";
        
        const taskCheckbox = document.createElement("div");
        taskCheckbox.className = `task-checkbox ${post.completed ? 'completed' : ''}`;
        taskCheckbox.onclick = () => toggleTaskCompletion(post);
        
        const taskText = document.createElement("div");
        taskText.className = `task-text ${post.completed ? 'completed' : ''}`;
        taskText.textContent = post.text;
        
        const taskActions = document.createElement("div");
        taskActions.className = "task-actions";
        
        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        
        editBtn.onclick = async () => {
            const { value: newText } = await Swal.fire({
                title: "Edit Task",
                input: "text",
                inputValue: post.text,
                inputPlaceholder: "Update your task...",
                showCancelButton: true,
                confirmButtonText: "Update",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#FF6B35",
                cancelButtonColor: "#6c757d"
            });

            if (newText && newText.trim() !== post.text) {
                try {
                    await updateDoc(doc(db, "posts", post.id), {
                        text: newText.trim(),
                        updatedAt: serverTimestamp()
                    });

                    Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "success",
                        title: "Task updated successfully!",
                        showConfirmButton: false,
                        timer: 2000
                    });

                    await loadPosts();
                } catch (error) {
                    Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "error",
                        title: "Update failed!",
                        text: error.message,
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            }
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        
        deleteBtn.onclick = async () => {
            const result = await Swal.fire({
                title: "Delete Task",
                text: "Are you sure you want to delete this task?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#FF6B35",
                cancelButtonColor: "#6c757d"
            });

            if (result.isConfirmed) {
                try {
                    await deleteDoc(doc(db, "posts", post.id));
                    
                    Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "success",
                        title: "Task deleted successfully!",
                        showConfirmButton: false,
                        timer: 2000
                    });

                    await loadPosts();
                } catch (error) {
                    Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "error",
                        title: "Delete failed!",
                        text: error.message,
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            }
        };

        const taskMeta = document.createElement("div");
        taskMeta.className = "task-meta";
        
        const taskDate = document.createElement("div");
        taskDate.className = "task-date";
        
        if (post.createdAt) {
            const date = post.createdAt.toDate ? post.createdAt.toDate() : new Date();
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            taskDate.innerHTML = `<i class="far fa-calendar"></i> ${formattedDate}`;
        }

        taskMeta.appendChild(taskDate);
        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);
        taskContent.appendChild(taskCheckbox);
        taskContent.appendChild(taskText);
        taskCard.appendChild(taskContent);
        taskCard.appendChild(taskActions);
        taskCard.appendChild(taskMeta);
        postsContainer.appendChild(taskCard);
    });
}

async function toggleTaskCompletion(post) {
    try {
        const newCompletedStatus = !post.completed;
        await updateDoc(doc(db, "posts", post.id), {
            completed: newCompletedStatus,
            updatedAt: serverTimestamp()
        });

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: newCompletedStatus ? "Task marked as completed!" : "Task marked as pending!",
            showConfirmButton: false,
            timer: 2000
        });

        await loadPosts();
    } catch (error) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title: "Update failed!",
            text: error.message,
            showConfirmButton: false,
            timer: 3000
        });
    }
}

function updateStatistics() {
    const total = allPosts.length;
    const completed = allPosts.filter(post => post.completed).length;
    const pending = total - completed;
    
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayPosts = allPosts.filter(post => {
        if (!post.createdAt) return false;
        const postDate = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
        return postDate >= todayStart;
    });

    totalTasks.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
    todayTasks.textContent = todayPosts.length;
    
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    completionRate.textContent = `${completionPercentage}%`;

    let streak = 0;
    if (allPosts.length > 0) {
        const dates = allPosts
            .map(post => {
                if (!post.createdAt) return null;
                const date = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
                return date.toDateString();
            })
            .filter(date => date !== null);
        
        const uniqueDates = [...new Set(dates)];
        const sortedDates = uniqueDates.sort((a, b) => new Date(b) - new Date(a));
        
        streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i-1]);
            const previousDate = new Date(sortedDates[i]);
            const diffTime = Math.abs(currentDate - previousDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }
    }
    
    streakCount.textContent = streak;
}

addBtn.addEventListener("click", async () => {
    const taskValue = taskInput.value.trim();
    
    if (!taskValue) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title: "Please enter a task!",
            showConfirmButton: false,
            timer: 2000
        });
        return;
    }

    try {
        await addDoc(collection(db, "posts"), {
            uid,
            text: taskValue,
            completed: false,
            createdAt: serverTimestamp(),
            updatedAt: null
        });

        taskInput.value = "";
        
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Task added successfully!",
            showConfirmButton: false,
            timer: 2000
        });

        await loadPosts();
    } catch (error) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title: "Failed to add task!",
            text: error.message,
            showConfirmButton: false,
            timer: 3000
        });
    }
});

taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addBtn.click();
    }
});

addFirstBtn.addEventListener("click", () => {
    taskInput.focus();
});

searchTask.addEventListener("input", () => {
    const searchTerm = searchTask.value.toLowerCase();
    const filtered = allPosts.filter(post => 
        post.text.toLowerCase().includes(searchTerm)
    );
    renderPosts(filtered);
});

filterSelect.addEventListener("change", () => {
    const filter = filterSelect.value;
    let filtered = [...allPosts];
    
    switch(filter) {
        case "today":
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            filtered = allPosts.filter(post => {
                if (!post.createdAt) return false;
                const postDate = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
                return postDate >= todayStart;
            });
            break;
        case "pending":
            filtered = allPosts.filter(post => !post.completed);
            break;
        case "completed":
            filtered = allPosts.filter(post => post.completed);
            break;
        default:
            filtered = allPosts;
    }
    
    renderPosts(filtered);
});

clearAllBtn.addEventListener("click", async () => {
    if (allPosts.length === 0) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: "No tasks to delete!",
            showConfirmButton: false,
            timer: 2000
        });
        return;
    }

    const result = await Swal.fire({
        title: "Clear All Tasks?",
        text: `This will delete all ${allPosts.length} tasks permanently!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete all!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#FF6B35",
        cancelButtonColor: "#6c757d"
    });

    if (result.isConfirmed) {
        try {
            const deletePromises = allPosts.map(post => 
                deleteDoc(doc(db, "posts", post.id))
            );
            await Promise.all(deletePromises);
            
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "All tasks deleted successfully!",
                showConfirmButton: false,
                timer: 2000
            });

            await loadPosts();
        } catch (error) {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Failed to delete tasks!",
                text: error.message,
                showConfirmButton: false,
                timer: 3000
            });
        }
    }
});

markAllBtn.addEventListener("click", async () => {
    if (allPosts.length === 0) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: "No tasks to mark!",
            showConfirmButton: false,
            timer: 2000
        });
        return;
    }

    const result = await Swal.fire({
        title: "Mark All Tasks",
        text: "Mark all tasks as completed?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Mark as Completed",
        cancelButtonText: "Mark as Pending",
        confirmButtonColor: "#FF6B35",
        cancelButtonColor: "#6c757d",
        showDenyButton: true,
        denyButtonText: "Cancel",
        denyButtonColor: "#6c757d"
    });

    if (result.isConfirmed || result.dismiss === Swal.DismissReason.cancel) {
        const markAsCompleted = result.isConfirmed;
        
        try {
            const updatePromises = allPosts.map(post => 
                updateDoc(doc(db, "posts", post.id), {
                    completed: markAsCompleted,
                    updatedAt: serverTimestamp()
                })
            );
            await Promise.all(updatePromises);
            
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: markAsCompleted ? "All tasks marked as completed!" : "All tasks marked as pending!",
                showConfirmButton: false,
                timer: 2000
            });

            await loadPosts();
        } catch (error) {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Failed to update tasks!",
                text: error.message,
                showConfirmButton: false,
                timer: 3000
            });
        }
    }
});

let sortAscending = true;
sortBtn.addEventListener("click", () => {
    const sorted = [...allPosts].sort((a, b) => {
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        
        if (sortAscending) {
            return dateA - dateB;
        } else {
            return dateB - dateA;
        }
    });
    
    sortAscending = !sortAscending;
    sortBtn.innerHTML = sortAscending ? 
        '<i class="fas fa-sort-up"></i> Sort Oldest' : 
        '<i class="fas fa-sort-down"></i> Sort Newest';
    
    renderPosts(sorted);
});