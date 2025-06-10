'use client'
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";

const Redirect = () => {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) return;
        
        const isStudent = user.type === 'Estudante';
        router.replace(isStudent ? '/notice' : '/requests');
    }, [user, router]);

    return <LoadingSpinner />;
};

export default Redirect;