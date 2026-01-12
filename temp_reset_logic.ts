
const handleResetQuiz = async () => {
    if (!editingId || editingId === 'new') return;

    if (confirm(`Tem certeza que deseja ZERAR todo o histórico e pontos do Quiz para o usuário ${formData.name}? Esta ação não pode ser desfeita.`)) {
        setIsLoading(true);
        try {
            const currentUserData = userList.find(u => u.id === editingId);
            if (!currentUserData) return;

            // @ts-ignore
            const updatedUser = { ...currentUserData, ...formData, quizHistory: [] };

            // @ts-ignore
            await saveUser(updatedUser);

            setFormData(prev => ({ ...prev, quizHistory: [] }));
            await loadUsers();
            onUpdateUser(updatedUser as User);

            alert('Histórico do Quiz zerado com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao zerar histórico.');
        } finally {
            setIsLoading(false);
        }
    }
};
