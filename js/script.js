document.addEventListener('DOMContentLoaded', () => {
    // --- Variables Globales y Datos Simulados ---
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;

    // A C T U A L I Z A C I Ó N : Añadimos 'propuestas' y aseguramos que 'foto' esté presente
    const candidatos = [
        {
            id: 'candidato1',
            nombre: 'Juan Pérez',
            lema: 'Por un futuro mejor para Bolivia',
            foto: 'https://via.placeholder.com/150/008080/ffffff?text=Juan+P', // Foto de ejemplo
            propuestas: [
                'Mejorar la educación pública con acceso a tecnología.',
                'Fomentar la inversión en pequeñas y medianas empresas.',
                'Implementar programas de salud preventiva a nivel nacional.'
            ]
        },
        {
            id: 'candidato2',
            nombre: 'María García',
            lema: 'Experiencia y compromiso para tu bienestar',
            foto: 'https://via.placeholder.com/150/77DD77/000000?text=Maria+G', // Foto de ejemplo
            propuestas: [
                'Fortalecer la seguridad ciudadana con mayor presencia policial.',
                'Desarrollar proyectos de infraestructura vial y logística.',
                'Promover la equidad de género y la participación ciudadana.'
            ]
        },
        {
            id: 'candidato3',
            nombre: 'Carlos Quispe',
            lema: 'La voz del pueblo en el poder',
            foto: 'https://via.placeholder.com/150/66cc66/ffffff?text=Carlos+Q', // Foto de ejemplo
            propuestas: [
                'Proteger el medio ambiente y los recursos naturales.',
                'Apoyar a los agricultores con subsidios y capacitación técnica.',
                'Reducir la burocracia para facilitar el emprendimiento.'
            ]
        },
        {
            id: 'candidato4',
            nombre: 'Ana Rojas',
            lema: 'Innovación y progreso para todos',
            foto: 'https://via.placeholder.com/150/006666/ffffff?text=Ana+R', // Foto de ejemplo
            propuestas: [
                'Incentivar el turismo y la cultura como motores económicos.',
                'Garantizar el acceso a vivienda digna para familias de bajos recursos.',
                'Modernizar la administración pública con herramientas digitales.'
            ]
        }
    ];

    // Simulación de votos iniciales para tener al menos 10 votos
    let votos = JSON.parse(localStorage.getItem('votos')) || {};
    if (Object.keys(votos).length === 0) {
        candidatos.forEach(c => votos[c.id] = 0);
        // Generar 10 votos aleatorios iniciales
        for (let i = 0; i < 10; i++) {
            const randomCandidate = candidatos[Math.floor(Math.random() * candidatos.length)];
            votos[randomCandidate.id]++;
        }
        localStorage.setItem('votos', JSON.stringify(votos));
    }

    // --- Elementos del DOM ---
    const registroForm = document.getElementById('registro-form');
    const loginForm = document.getElementById('login-form');
    const votacionSection = document.getElementById('votacion-section');
    const candidatosList = document.getElementById('candidatos-list');
    const votarBtn = document.getElementById('votar-btn');
    const resultadosChart = document.getElementById('resultados-chart');
    const userNameSpan = document.getElementById('user-name');
    const votoConfirmMessage = document.getElementById('voto-confirm-message');
    const votoAlreadyMessage = document.getElementById('voto-already-message');
    const totalVotosSpan = document.getElementById('total-votos');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const newPasswordFields = document.getElementById('new-password-fields');
    const forgotPasswordSubmitBtn = document.getElementById('forgot-password-submit-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutNavItem = document.getElementById('logout-nav-item');
    const logoutSuccessModal = new bootstrap.Modal(document.getElementById('logoutSuccessModal'));


    // --- Funciones Auxiliares ---

    // Función para validar la complejidad de la contraseña
    function isValidPassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
    }

    // Función para calcular la edad
    function calculateAge(dob, votingDate) {
        const birthDate = new Date(dob);
        const voteDate = new Date(votingDate);
        let age = voteDate.getFullYear() - birthDate.getFullYear();
        const m = voteDate.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && voteDate.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Función para guardar usuarios y votos en Local Storage
    function saveData() {
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('votos', JSON.stringify(votos));
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    }

    // A C T U A L I Z A C I Ó N : Modificamos la carga de candidatos para incluir propuestas
    function loadCandidatos() {
        candidatosList.innerHTML = '';
        candidatos.forEach(candidato => {
            const card = document.createElement('div');
            card.className = 'col';
            card.innerHTML = `
                <div class="card candidate-card h-100" data-id="${candidato.id}">
                    <input type="radio" name="candidato" id="${candidato.id}-radio" value="${candidato.id}" class="d-none">
                    <label for="${candidato.id}-radio" class="d-block h-100 p-3">
                        <img src="${candidato.foto}" class="img-fluid mb-3 rounded-circle border border-primary" alt="${candidato.nombre}">
                        <h5>${candidato.nombre}</h5>
                        <p class="card-text text-muted">${candidato.lema}</p>
                        <hr>
                        <h6>Propuestas:</h6>
                        <ul class="list-unstyled text-start small">
                            ${candidato.propuestas.map(prop => `<li><i class="bi bi-check-circle-fill text-success me-2"></i>${prop}</li>`).join('')}
                        </ul>
                    </label>
                </div>
            `;
            candidatosList.appendChild(card);
        });

        // Aseguramos que los íconos de Bootstrap estén cargados si se usan
        // Necesitarás añadir la CDN de Bootstrap Icons en tu HTML <head> si no lo tienes:
        // <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">


        document.querySelectorAll('.candidate-card').forEach(card => {
            card.addEventListener('click', () => {
                // Solo permite selección si el usuario no ha votado aún
                if (!loggedInUser || loggedInUser.hasVoted) {
                    return;
                }
                document.querySelectorAll('.candidate-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                card.querySelector('input[type="radio"]').checked = true;
                votarBtn.disabled = false;
            });
        });
        // Deshabilitar radios si el usuario ya votó
        if (loggedInUser && loggedInUser.hasVoted) {
            document.querySelectorAll('input[name="candidato"]').forEach(radio => radio.disabled = true);
        }
    }

    // Función para actualizar las estadísticas de votación
    function updateResultados() {
        resultadosChart.innerHTML = '';
        let totalVotos = Object.values(votos).reduce((sum, count) => sum + count, 0);
        totalVotosSpan.textContent = totalVotos;

        if (totalVotos === 0) {
            resultadosChart.innerHTML = '<p class="text-center text-muted">Aún no hay votos registrados.</p>';
            return;
        }

        candidatos.forEach(candidato => {
            const votosCandidato = votos[candidato.id] || 0;
            const porcentaje = totalVotos > 0 ? (votosCandidato / totalVotos) * 100 : 0;

            const resultItem = document.createElement('div');
            resultItem.className = 'candidate-result-item';
            resultItem.innerHTML = `
                <div class="candidate-name">${candidato.nombre}</div>
                <div class="progress-container">
                    <div class="progress" role="progressbar" aria-label="${candidato.nombre} progress" aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100">
                        <div class="progress-bar" style="width: ${porcentaje.toFixed(2)}%">${votosCandidato} (${porcentaje.toFixed(2)}%)</div>
                    </div>
                </div>
            `;
            resultadosChart.appendChild(resultItem);
        });
    }

    // Función para actualizar la visibilidad de las secciones y el botón de logout
    function updateUIVisibility() {
        const navLinks = document.querySelectorAll('#navbarNav .nav-link');
        navLinks.forEach(link => link.classList.remove('active')); // Limpiar clase active

        if (loggedInUser) {
            // Usuario logeado: mostrar votación y logout, ocultar registro/login
            votacionSection.classList.remove('d-none');
            document.getElementById('registro-section').classList.add('d-none');
            document.getElementById('login-section').classList.add('d-none');
            logoutNavItem.classList.remove('d-none');
            userNameSpan.textContent = `${loggedInUser.nombres} ${loggedInUser.apellidos}`;
            
            // Marcar la sección de votación como activa en la navbar
            document.querySelector('a[href="#votacion-section"]').classList.add('active');

            if (loggedInUser.hasVoted) {
                votarBtn.disabled = true;
                votoAlreadyMessage.classList.remove('d-none');
                votoConfirmMessage.classList.add('d-none');
                document.querySelectorAll('input[name="candidato"]').forEach(radio => radio.disabled = true); // Deshabilitar radios
            } else {
                votarBtn.disabled = false;
                votoAlreadyMessage.classList.add('d-none');
                votoConfirmMessage.classList.add('d-none');
                document.querySelectorAll('input[name="candidato"]').forEach(radio => radio.disabled = false); // Habilitar radios
            }
            loadCandidatos(); // Recargar candidatos para aplicar estados de votación
        } else {
            // Usuario no logeado: mostrar registro/login, ocultar votación y logout
            votacionSection.classList.add('d-none');
            document.getElementById('registro-section').classList.remove('d-none');
            document.getElementById('login-section').classList.remove('d-none');
            logoutNavItem.classList.add('d-none');
            
            // Marcar la sección de registro como activa en la navbar
            document.querySelector('a[href="#registro-section"]').classList.add('active');

            // Asegurarse de que el formulario de login y registro estén limpios
            loginForm.reset();
            registroForm.reset();
            registroForm.classList.remove('was-validated');
            document.querySelectorAll('.form-control.is-valid, .form-select.is-valid, .form-control.is-invalid, .form-select.is-invalid').forEach(el => {
                el.classList.remove('is-valid', 'is-invalid');
            });
        }
    }


    // --- Event Listeners (Resto del código permanece igual) ---

    // 1. Manejo del Formulario de Registro
    registroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        registroForm.classList.add('was-validated'); // Activa las validaciones de Bootstrap

        const ci = document.getElementById('registroCI').value;
        const nombres = document.getElementById('registroNombres').value;
        const apellidos = document.getElementById('registroApellidos').value;
        const email = document.getElementById('registroEmail').value;
        const telefono = document.getElementById('registroTelefono').value;
        const departamento = document.getElementById('registroDepartamento').value;
        const fechaNacimiento = document.getElementById('registroFechaNacimiento').value;
        const fechaVotacion = document.getElementById('registroFechaVotacion').value; // Usar esta para la validación
        const password = document.getElementById('registroPassword').value;
        const confirmPassword = document.getElementById('registroConfirmPassword').value;

        // Validaciones personalizadas
        let isValid = true;
        const passwordFeedback = document.getElementById('password-feedback');
        const confirmPasswordFeedback = document.getElementById('confirm-password-feedback');

        if (!isValidPassword(password)) {
            registroPassword.classList.add('is-invalid');
            passwordFeedback.textContent = 'Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo.';
            isValid = false;
        } else {
            registroPassword.classList.remove('is-invalid');
            registroPassword.classList.add('is-valid');
        }

        if (password !== confirmPassword) {
            registroConfirmPassword.classList.add('is-invalid');
            confirmPasswordFeedback.textContent = 'Las contraseñas no coinciden.';
            isValid = false;
        } else {
            registroConfirmPassword.classList.remove('is-invalid');
            registroConfirmPassword.classList.add('is-valid');
        }

        const age = calculateAge(fechaNacimiento, fechaVotacion);
        if (age < 18) {
            document.getElementById('registroFechaNacimiento').classList.add('is-invalid');
            document.getElementById('registroFechaNacimiento').nextElementSibling.textContent = 'Debes tener al menos 18 años para registrarte.';
            isValid = false;
        } else {
            document.getElementById('registroFechaNacimiento').classList.remove('is-invalid');
            document.getElementById('registroFechaNacimiento').classList.add('is-valid');
        }

        // Si todas las validaciones de Bootstrap y personalizadas pasan
        if (registroForm.checkValidity() && isValid) {
            const userExists = users.some(user => user.email === email || user.ci === ci);
            if (userExists) {
                alert('Error: Ya existe un usuario con este correo electrónico o Carnet de Identidad.');
            } else {
                const newUser = {
                    ci,
                    nombres,
                    apellidos,
                    email,
                    telefono,
                    departamento,
                    fechaNacimiento,
                    password,
                    hasVoted: false
                };
                users.push(newUser);
                saveData();
                alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
                registroForm.reset();
                registroForm.classList.remove('was-validated'); // Limpia las validaciones visuales
                // Eliminar clases is-valid/is-invalid manualmente para campos que no se resetean completamente
                document.querySelectorAll('.form-control.is-valid, .form-select.is-valid, .form-control.is-invalid, .form-select.is-invalid').forEach(el => {
                    el.classList.remove('is-valid', 'is-invalid');
                });
            }
        }
    });

    // Validaciones en tiempo real para la contraseña de registro
    const registroPassword = document.getElementById('registroPassword');
    const registroConfirmPassword = document.getElementById('registroConfirmPassword');

    registroPassword.addEventListener('input', () => {
        const password = registroPassword.value;
        const passwordFeedback = document.getElementById('password-feedback');
        if (isValidPassword(password)) {
            registroPassword.classList.remove('is-invalid');
            registroPassword.classList.add('is-valid');
        } else {
            registroPassword.classList.remove('is-valid');
            registroPassword.classList.add('is-invalid');
            passwordFeedback.textContent = 'Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo.';
        }
        // También verificar la confirmación si se ha ingresado algo
        if (registroConfirmPassword.value.length > 0) {
            if (password !== registroConfirmPassword.value) {
                registroConfirmPassword.classList.remove('is-valid');
                registroConfirmPassword.classList.add('is-invalid');
                document.getElementById('confirm-password-feedback').textContent = 'Las contraseñas no coinciden.';
            } else {
                registroConfirmPassword.classList.remove('is-invalid');
                registroConfirmPassword.classList.add('is-valid');
            }
        }
    });

    registroConfirmPassword.addEventListener('input', () => {
        const password = registroPassword.value;
        const confirmPassword = registroConfirmPassword.value;
        if (password === confirmPassword && confirmPassword.length > 0) { // Solo si hay algo escrito
            registroConfirmPassword.classList.remove('is-invalid');
            registroConfirmPassword.classList.add('is-valid');
        } else {
            registroConfirmPassword.classList.remove('is-valid');
            registroConfirmPassword.classList.add('is-invalid');
            document.getElementById('confirm-password-feedback').textContent = 'Las contraseñas no coinciden.';
        }
    });

    // 2. Manejo del Formulario de Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Encuentra el usuario y si su contraseña coincide
        const user = users.find(u => u.email === email);
        if (user && user.password === password) {
            loggedInUser = user;
            saveData();
            alert(`¡Bienvenido/a, ${loggedInUser.nombres}!`);
            updateUIVisibility(); // Actualiza la UI según el estado de logeado
            // Scroll a la sección de votación
            document.getElementById('votacion-section').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Error: Credenciales incorrectas. Inténtalo de nuevo.');
        }
    });

    // 3. Manejo de la Votación
    votarBtn.addEventListener('click', () => {
        if (!loggedInUser) {
            alert('Por favor, inicia sesión para votar.');
            return;
        }

        if (loggedInUser.hasVoted) {
            alert('Ya has votado. Solo puedes votar una vez.');
            return;
        }

        const selectedCandidateRadio = document.querySelector('input[name="candidato"]:checked');
        if (!selectedCandidateRadio) {
            alert('Por favor, selecciona un candidato antes de votar.');
            return;
        }

        const selectedCandidateId = selectedCandidateRadio.value;
        votos[selectedCandidateId]++;
        
        // Actualizar el estado del usuario en el array de usuarios global y en localStorage
        const userIndex = users.findIndex(u => u.email === loggedInUser.email);
        if (userIndex !== -1) {
            users[userIndex].hasVoted = true;
            loggedInUser.hasVoted = true; // Actualizar también el objeto loggedInUser
        }
        
        saveData();

        alert('¡Voto registrado con éxito!');
        votoConfirmMessage.classList.remove('d-none');
        votoAlreadyMessage.classList.add('d-none');
        votarBtn.disabled = true; // Deshabilitar el botón después de votar

        updateResultados(); // Actualizar resultados inmediatamente
        // Deshabilitar todos los radios de candidatos
        document.querySelectorAll('input[name="candidato"]').forEach(radio => radio.disabled = true);
        document.querySelectorAll('.candidate-card').forEach(card => card.classList.remove('selected'));
    });

    // 4. Manejo del Formulario de Olvidé mi Contraseña
    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        let userFound = users.find(u => u.email === email);

        if (forgotPasswordSubmitBtn.textContent === 'Enviar') {
            if (userFound) {
                alert('Si tu correo está registrado, recibirás un campo para introducir una nueva contraseña.');
                newPasswordFields.classList.remove('d-none');
                forgotPasswordSubmitBtn.textContent = 'Restablecer Contraseña';
                document.getElementById('forgotEmail').readOnly = true; // No permitir cambiar el email
            } else {
                alert('Correo no encontrado. Por favor, verifica el correo ingresado.');
                newPasswordFields.classList.add('d-none'); // Asegurarse de que los campos estén ocultos si el correo no existe
            }
        } else if (forgotPasswordSubmitBtn.textContent === 'Restablecer Contraseña') {
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            let isValidReset = true;
            const newPasswordFeedback = document.getElementById('new-password-feedback');
            const confirmNewPasswordFeedback = document.getElementById('confirm-new-password-feedback');

            if (!isValidPassword(newPassword)) {
                document.getElementById('newPassword').classList.add('is-invalid');
                newPasswordFeedback.textContent = 'Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo.';
                isValidReset = false;
            } else {
                document.getElementById('newPassword').classList.remove('is-invalid');
                document.getElementById('newPassword').classList.add('is-valid');
            }

            if (newPassword !== confirmNewPassword) {
                document.getElementById('confirmNewPassword').classList.add('is-invalid');
                confirmNewPasswordFeedback.textContent = 'Las contraseñas no coinciden.';
                isValidReset = false;
            } else {
                document.getElementById('confirmNewPassword').classList.remove('is-invalid');
                document.getElementById('confirmNewPassword').classList.add('is-valid');
            }

            if (isValidReset) {
                // Actualizar la contraseña del usuario encontrado
                const userIndex = users.findIndex(u => u.email === email);
                if (userIndex !== -1) {
                    users[userIndex].password = newPassword;
                }
                saveData();
                alert('Tu contraseña ha sido restablecida con éxito.');
                
                // Resetear el modal
                forgotPasswordForm.reset();
                newPasswordFields.classList.add('d-none');
                forgotPasswordSubmitBtn.textContent = 'Enviar';
                document.getElementById('forgotEmail').readOnly = false;
                document.getElementById('newPassword').classList.remove('is-valid', 'is-invalid');
                document.getElementById('confirmNewPassword').classList.remove('is-valid', 'is-invalid');
                const forgotPasswordModal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                if (forgotPasswordModal) forgotPasswordModal.hide();
            }
        }
    });

    // Validaciones en tiempo real para el modal de nueva contraseña
    document.getElementById('newPassword').addEventListener('input', () => {
        const password = document.getElementById('newPassword').value;
        const passwordFeedback = document.getElementById('new-password-feedback');
        if (isValidPassword(password)) {
            document.getElementById('newPassword').classList.remove('is-invalid');
            document.getElementById('newPassword').classList.add('is-valid');
        } else {
            document.getElementById('newPassword').classList.remove('is-valid');
            document.getElementById('newPassword').classList.add('is-invalid');
            passwordFeedback.textContent = 'Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo.';
        }
        if (document.getElementById('confirmNewPassword').value.length > 0) {
            if (password !== document.getElementById('confirmNewPassword').value) {
                document.getElementById('confirmNewPassword').classList.remove('is-valid');
                document.getElementById('confirmNewPassword').classList.add('is-invalid');
                document.getElementById('confirm-new-password-feedback').textContent = 'Las contraseñas no coinciden.';
            } else {
                document.getElementById('confirmNewPassword').classList.remove('is-invalid');
                document.getElementById('confirmNewPassword').classList.add('is-valid');
            }
        }
    });

    document.getElementById('confirmNewPassword').addEventListener('input', () => {
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;
        if (password === confirmPassword && confirmPassword.length > 0) {
            document.getElementById('confirmNewPassword').classList.remove('is-invalid');
            document.getElementById('confirmNewPassword').classList.add('is-valid');
        } else {
            document.getElementById('confirmNewPassword').classList.remove('is-valid');
            document.getElementById('confirmNewPassword').classList.add('is-invalid');
            document.getElementById('confirm-new-password-feedback').textContent = 'Las contraseñas no coinciden.';
        }
    });

    // Resetear el formulario de Olvidé Contraseña al cerrar el modal
    const forgotPasswordModalElement = document.getElementById('forgotPasswordModal');
    forgotPasswordModalElement.addEventListener('hidden.bs.modal', () => {
        forgotPasswordForm.reset();
        newPasswordFields.classList.add('d-none');
        forgotPasswordSubmitBtn.textContent = 'Enviar';
        document.getElementById('forgotEmail').readOnly = false;
        document.getElementById('newPassword').classList.remove('is-valid', 'is-invalid');
        document.getElementById('confirmNewPassword').classList.remove('is-valid', 'is-invalid');
    });

    // 5. Manejo del Cierre de Sesión
    logoutBtn.addEventListener('click', () => {
        loggedInUser = null; // Eliminar el usuario logeado
        localStorage.removeItem('loggedInUser'); // Limpiar del localStorage
        
        // Mostrar el modal de agradecimiento
        logoutSuccessModal.show();

        // Actualizar la interfaz de usuario
        updateUIVisibility();
        // Scroll a la parte superior de la página o a la sección de registro/login
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Inicialización al Cargar la Página ---
    loadCandidatos();
    updateResultados();
    updateUIVisibility(); // Llama a esta función al inicio para establecer el estado correcto de la UI
});