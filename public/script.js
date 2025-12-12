// PROTECCIÓN DE SESION

const user = JSON.parse(sessionStorage.getItem('user'));

if (!user) {
    window.location.href = 'index.html';
} else {
    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = user.name;
    }
}

//VARIABLES GLOBALES

let employees = [];
let departments = [];


if (document.getElementById('logoutBtn')) {

    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('addEmployeeBtn').addEventListener('click', showAddForm);
    document.getElementById('cancelNewBtn').addEventListener('click', hideAddForm);
    document.getElementById('saveNewBtn').addEventListener('click', addEmployee);
    document.getElementById('saveEditBtn').addEventListener('click', updateEmployee);

    loadDepartments();
    loadEmployees();
}

//FUNCIONES DE SESION

function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
}

// FORMULARIO NUEVO EMPLEADO

function showAddForm() {
    document.getElementById('addForm').style.display = 'block';
    clearNewForm();
}

function hideAddForm() {
    document.getElementById('addForm').style.display = 'none';
    clearNewForm();
}

function clearNewForm() {
    document.getElementById('newFname').value = '';
    document.getElementById('newMinit').value = '';
    document.getElementById('newLname').value = '';
    document.getElementById('newSsn').value = '';
    document.getElementById('newBdate').value = '';
    document.getElementById('newAddress').value = '';
    document.getElementById('newSex').value = 'M';
    document.getElementById('newSalary').value = '';
    document.getElementById('newSuperSsn').value = '';
    document.getElementById('newDno').value = '';
}

// CARGAR DEPARTAMENTOS

async function loadDepartments() {
    try {
        const response = await fetch('/api/departments');
        departments = await response.json();

        const newDnoSelect = document.getElementById('newDno');
        newDnoSelect.innerHTML = '<option value="">Seleccionar...</option>';

        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.Dnumber;
            option.textContent = dept.Dname;
            newDnoSelect.appendChild(option);
        });

        const editDnoSelect = document.getElementById('editDno');
        editDnoSelect.innerHTML = '';

        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.Dnumber;
            option.textContent = dept.Dname;
            editDnoSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error cargando departamentos:', error);
        alert('Error al cargar departamentos');
    }
}

// CARGAR EMPLEADOS

async function loadEmployees() {
    try {
        const response = await fetch('/api/employees');
        employees = await response.json();
        renderEmployees();
    } catch (error) {
        console.error('Error cargando empleados:', error);
        alert('Error al cargar empleados');
    }
}

function renderEmployees() {
    const tbody = document.getElementById('employeeTableBody');

    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" align="center">No hay empleados registrados</td></tr>';
        document.getElementById('totalEmployees').textContent = '0';
        return;
    }

    let html = '';
    employees.forEach(emp => {
        html += `
            <tr>
                <td>${emp.Fname} ${emp.Minit || ''} ${emp.Lname}</td>
                <td>${emp.Ssn}</td>
                <td>${emp.Sex}</td>
                <td>${emp.Bdate ? new Date(emp.Bdate).toLocaleDateString() : 'N/A'}</td>
                <td>$${emp.Salary ? parseFloat(emp.Salary).toLocaleString() : '0'}</td>
                <td>${emp.department_name || 'N/A'}</td>
                <td>
                    <button class="btn-edit" onclick="openEditModal('${emp.Ssn}')">Editar</button>
                    <button class="btn-delete" onclick="deleteEmployee('${emp.Ssn}')">Eliminar</button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    document.getElementById('totalEmployees').textContent = employees.length;
}

// AGREGAR EMPLEADO

async function addEmployee() {
    const newEmployee = {
        Fname: document.getElementById('newFname').value.trim(),
        Minit: document.getElementById('newMinit').value.trim() || null,
        Lname: document.getElementById('newLname').value.trim(),
        Ssn: document.getElementById('newSsn').value.trim(),
        Bdate: document.getElementById('newBdate').value || null,
        Address: document.getElementById('newAddress').value.trim() || null,
        Sex: document.getElementById('newSex').value,
        Salary: document.getElementById('newSalary').value || null,
        Super_ssn: document.getElementById('newSuperSsn').value.trim() || null,
        Dno: document.getElementById('newDno').value
    };

    if (!newEmployee.Fname || !newEmployee.Lname || !newEmployee.Ssn || !newEmployee.Dno) {
        alert('Por favor completa los campos obligatorios (Nombre, Apellido, SSN, Departamento)');
        return;
    }

    if (newEmployee.Ssn.length !== 9) {
        alert('El SSN debe tener exactamente 9 dígitos');
        return;
    }

    try {
        const response = await fetch('/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newEmployee)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Empleado agregado exitosamente');
            hideAddForm();
            loadEmployees();
        } else {
            alert(data.error || 'Error al agregar empleado');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al agregar empleado');
    }
}

// EDITAR EMPLEADO

function openEditModal(ssn) {
    const employee = employees.find(emp => emp.Ssn === ssn);
    if (!employee) return;

    document.getElementById('editSsn').value = employee.Ssn;
    document.getElementById('editSsnDisplay').textContent = employee.Ssn;
    document.getElementById('editFname').value = employee.Fname;
    document.getElementById('editMinit').value = employee.Minit || '';
    document.getElementById('editLname').value = employee.Lname;
    document.getElementById('editBdate').value = employee.Bdate ? employee.Bdate.split('T')[0] : '';
    document.getElementById('editAddress').value = employee.Address || '';
    document.getElementById('editSex').value = employee.Sex;
    document.getElementById('editSalary').value = employee.Salary || '';
    document.getElementById('editSuperSsn').value = employee.Super_ssn || '';
    document.getElementById('editDno').value = employee.Dno;

    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

//  ACTUALIZAR EMPLEADO

async function updateEmployee() {
    const ssn = document.getElementById('editSsn').value;

    const updatedEmployee = {
        Fname: document.getElementById('editFname').value.trim(),
        Minit: document.getElementById('editMinit').value.trim() || null,
        Lname: document.getElementById('editLname').value.trim(),
        Bdate: document.getElementById('editBdate').value || null,
        Address: document.getElementById('editAddress').value.trim() || null,
        Sex: document.getElementById('editSex').value,
        Salary: document.getElementById('editSalary').value || null,
        Super_ssn: document.getElementById('editSuperSsn').value.trim() || null,
        Dno: document.getElementById('editDno').value
    };

    if (!updatedEmployee.Fname || !updatedEmployee.Lname || !updatedEmployee.Dno) {
        alert('Por favor completa los campos obligatorios');
        return;
    }

    try {
        const response = await fetch('/api/employees/' + ssn, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedEmployee)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Empleado actualizado exitosamente');
            closeEditModal();
            loadEmployees();
        } else {
            alert(data.error || 'Error al actualizar empleado');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al actualizar empleado');
    }
}

// ELIMINAR EMPLEADO

async function deleteEmployee(ssn) {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return;

    try {
        const response = await fetch('/api/employees/' + ssn, { method: 'DELETE' });
        const data = await response.json();

        if (response.ok) {
            alert('Empleado eliminado exitosamente');
            loadEmployees();
        } else {
            alert(data.error || 'Error al eliminar empleado');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al eliminar empleado');
    }
}
