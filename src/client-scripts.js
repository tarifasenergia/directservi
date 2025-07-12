// /src/client-scripts.js

export const ClientSideScripts = () => `

  function setVisible(element, visible) {
    if (element) {
      if (visible) {
        element.classList.remove('d-none');
      } else {
        element.classList.add('d-none');
      }
    }
  }

  function previewLogo(event) {
    const reader = new FileReader();
    const modal = event.target.closest('.modal');
    if (!modal) return;
    
    const output = modal.querySelector('.logo-preview-img');
    const base64Field = modal.querySelector('.logo-b64-hidden');
    
    reader.onload = function(){
      if (output) {
        output.src = reader.result;
        setVisible(output, true);
        if (base64Field) base64Field.value = reader.result;
      }
    };

    if (event.target.files[0]) {
      reader.readAsDataURL(event.target.files[0]);
    } else {
      if (base64Field) base64Field.value = output.dataset.existingLogo || '';
      if (!output.dataset.existingLogo) {
          output.src = '#';
          setVisible(output, false);
      } else {
          output.src = output.dataset.existingLogo;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lógica para el Modal de Compañías ---
    const companyModal = document.getElementById('companyModal');
    if (companyModal) {
      const form = document.getElementById('companyForm');
      const modalLabel = document.getElementById('companyModalLabel');
      const submitBtn = document.getElementById('companySubmitBtn');
      const idInput = document.getElementById('company_id_input');
      const nameInput = document.getElementById('company_name_input');
      const cifInput = document.getElementById('company_cif_input');
      const addressInput = document.getElementById('company_address_input');

      document.getElementById('createCompanyBtn')?.addEventListener('click', () => {
        form.action = '/superadmin/businesses?action=create_company';
        modalLabel.textContent = 'Crear Nueva Compañía';
        submitBtn.textContent = 'Crear Compañía';
        form.reset();
        idInput.value = '';
      });

      document.querySelectorAll('.edit-company-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const data = e.currentTarget.dataset;
          form.action = '/superadmin/businesses?action=update_company';
          modalLabel.textContent = 'Editar Compañía';
          submitBtn.textContent = 'Guardar Cambios';
          idInput.value = data.id;
          nameInput.value = data.name;
          cifInput.value = data.cif;
          addressInput.value = data.address;
        });
      });
    }

    // --- Lógica para el Modal de Negocios ---
    const businessModal = document.getElementById('businessModal');
    if (businessModal) {
        const form = document.getElementById('businessForm');
        const modalLabel = document.getElementById('businessModalLabel');
        const submitBtn = document.getElementById('businessSubmitBtn');
        const idInput = form.querySelector('[name="id"]');
        const nameInput = form.querySelector('[name="name"]');
        const companySelect = form.querySelector('[name="company_id"]');
        const statusSelect = form.querySelector('[name="status"]');
        const logoPreview = form.querySelector('.logo-preview-img');
        const logoHiddenInput = form.querySelector('.logo-b64-hidden');
        const primaryColorInput = form.querySelector('[name="primary_color"]');
        const secondaryColorInput = form.querySelector('[name="secondary_color"]');

        document.getElementById('createBusinessBtn')?.addEventListener('click', () => {
            form.action = '/superadmin/businesses?action=create_business';
            modalLabel.textContent = 'Crear Nuevo Negocio';
            submitBtn.textContent = 'Crear Negocio';
            form.reset();
            idInput.value = '';
            logoPreview.src = '#';
            logoPreview.dataset.existingLogo = '';
            setVisible(logoPreview, false);
        });

        document.querySelectorAll('.edit-business-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                modalLabel.textContent = 'Cargando datos...';
                form.reset();
                idInput.value = id;
                
                try {
                    const response = await fetch('/superadmin/businesses?edit_business_id=' + id);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();
                    
                    form.action = '/superadmin/businesses?action=update_business';
                    modalLabel.textContent = 'Editar Negocio: ' + data.name;
                    submitBtn.textContent = 'Guardar Cambios';
                    nameInput.value = data.name;
                    companySelect.value = data.company_id;
                    statusSelect.value = data.status;

                    if (data.style) {
                        primaryColorInput.value = data.style.primary_color || '#399f82';
                        secondaryColorInput.value = data.style.secondary_color || '#4a4548';
                        if (data.style.logo_base64) {
                            logoPreview.src = data.style.logo_base64;
                            logoPreview.dataset.existingLogo = data.style.logo_base64;
                            logoHiddenInput.value = data.style.logo_base64;
                            setVisible(logoPreview, true);
                        } else {
                           logoPreview.src = '#';
                           logoPreview.dataset.existingLogo = '';
                           setVisible(logoPreview, false);
                        }
                    } else {
                        primaryColorInput.value = '#399f82';
                        secondaryColorInput.value = '#4a4548';
                        logoPreview.src = '#';
                        logoPreview.dataset.existingLogo = '';
                        setVisible(logoPreview, false);
                    }
                } catch (error) {
                    console.error('Failed to fetch business details:', error);
                    modalLabel.textContent = 'Error al cargar datos';
                }
            });
        });
    }

    // --- Lógica para el Modal de Proveedores ---
    const providerModal = document.getElementById('providerModal');
    if(providerModal) {
        const form = document.getElementById('providerForm');
        const modalLabel = document.getElementById('providerModalLabel');
        const submitBtn = document.getElementById('providerSubmitBtn');
        const idInput = document.getElementById('provider_id_input');
        const nameInput = document.getElementById('provider_name_input');
        const notesInput = document.getElementById('provider_notes_input');
        const logoPreview = form.querySelector('.logo-preview-img');
        const logoHiddenInput = form.querySelector('.logo-b64-hidden');
        const logoFileInput = form.querySelector('.logo-file-input');
        
        document.getElementById('createProviderBtn')?.addEventListener('click', () => {
            form.action = '/superadmin/providers?action=create_provider';
            modalLabel.textContent = 'Añadir Nuevo Proveedor';
            submitBtn.textContent = 'Crear Proveedor';
            form.reset();
            idInput.value = '';
            logoPreview.src = '#';
            setVisible(logoPreview, false);
            logoFileInput.value = '';
        });

        document.querySelectorAll('.edit-provider-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const data = e.currentTarget.dataset;
                form.action = '/superadmin/providers?action=update_provider';
                modalLabel.textContent = 'Editar Proveedor';
                submitBtn.textContent = 'Guardar Cambios';

                idInput.value = data.id;
                nameInput.value = data.name;
                notesInput.value = data.notes;
                
                logoFileInput.value = '';
                if(data.logo && data.logo !== 'null') {
                    logoPreview.src = data.logo;
                    logoPreview.dataset.existingLogo = data.logo;
                    logoHiddenInput.value = data.logo;
                    setVisible(logoPreview, true);
                } else {
                    logoPreview.src = '#';
                    logoPreview.dataset.existingLogo = '';
                    logoHiddenInput.value = '';
                    setVisible(logoPreview, false);
                }
            });
        });
    }

    // --- Lógica para el Modal de Usuarios ---
    const userModal = document.getElementById('userModal');
    if (userModal) {
        const form = document.getElementById('userForm');
        const modalLabel = document.getElementById('userModalLabel');
        const submitBtn = document.getElementById('userSubmitBtn');
        const idInput = document.getElementById('user_id_input');
        const nameInput = document.getElementById('full_name_input');
        const emailInput = document.getElementById('email_input');
        const roleSelect = document.getElementById('role_id_select');
        const businessSelect = document.getElementById('business_id_select');
        const passwordInput = document.getElementById('password_input');
        const activeCheck = document.getElementById('is_active_check');
        
        document.getElementById('createUserBtn')?.addEventListener('click', () => {
            form.action = '/superadmin/users?action=create_user';
            modalLabel.textContent = 'Crear Nuevo Usuario';
            submitBtn.textContent = 'Crear Usuario';
            form.reset();
            idInput.value = '';
            emailInput.disabled = false;
            passwordInput.required = true;
            activeCheck.checked = true;
        });

        document.querySelectorAll('button[data-bs-target="#userModal"]').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                if (!id) return; 

                modalLabel.textContent = 'Cargando datos...';
                form.reset();
                idInput.value = id;
                emailInput.disabled = true;
                passwordInput.required = false;

                try {
                    const response = await fetch('/superadmin/users?edit_user_id=' + id);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();
                    
                    form.action = '/superadmin/users?action=update_user';
                    modalLabel.textContent = 'Editar Usuario: ' + data.full_name;
                    submitBtn.textContent = 'Guardar Cambios';
                    
                    nameInput.value = data.full_name;
                    emailInput.value = data.email;
                    roleSelect.value = data.role_id;
                    businessSelect.value = data.business_id || '';
                    activeCheck.checked = data.is_active;
                } catch (error) {
                    console.error('Failed to fetch user details:', error);
                    modalLabel.textContent = 'Error al cargar datos';
                }
            });
        });

        roleSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const roleName = selectedOption.dataset.name;
            if (roleName === 'superadmin') {
                businessSelect.value = '';
                businessSelect.disabled = true;
            } else {
                businessSelect.disabled = false;
            }
        });
    }

  });
`;