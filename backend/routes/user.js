const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');

// GET /api/user/profile - Obtener perfil completo del usuario
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json({ user });
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
});

// PATCH /api/user/profile - Actualizar perfil del usuario
router.patch('/profile', auth, async (req, res) => {
    try {
        const { name, picture, preferences } = req.body;
        
        const updateData = {};
        if (name) updateData.name = name;
        if (picture) updateData.picture = picture;
        if (preferences) {
            updateData['preferences.theme'] = preferences.theme || req.user.preferences?.theme;
            updateData['preferences.notifications'] = preferences.notifications !== undefined 
                ? preferences.notifications 
                : req.user.preferences?.notifications;
            updateData['preferences.publicProfile'] = preferences.publicProfile !== undefined
                ? preferences.publicProfile
                : req.user.preferences?.publicProfile;
        }
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({ 
            message: 'Perfil actualizado exitosamente',
            user 
        });
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
});

// GET /api/user/stats - Obtener estadísticas del usuario
router.get('/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        // Obtener transacciones para estadísticas detalladas
        const transactions = await CreditTransaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);
        
        const stats = {
            level: user.level,
            levelName: user.levelName,
            totalImagesGenerated: user.totalImagesGenerated,
            credits: user.credits,
            totalCreditsSpent: user.stats.totalCreditsSpent,
            communityLikes: user.stats.communityLikes,
            referralCount: user.referralCount,
            referralEarnings: user.referralEarnings,
            dailyStreakDays: user.dailyStreakDays,
            totalDailyRewards: user.totalDailyRewards,
            recentTransactions: transactions
        };
        
        res.json({ stats });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// POST /api/user/daily-reward - Reclamar recompensa diaria
router.post('/daily-reward', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user.canClaimDailyReward()) {
            return res.status(400).json({ 
                error: 'Ya reclamaste tu recompensa diaria',
                nextRewardAt: new Date(user.lastDailyReward.getTime() + 24 * 60 * 60 * 1000)
            });
        }
        
        // Calcular racha
        const now = new Date();
        const lastReward = user.lastDailyReward ? new Date(user.lastDailyReward) : null;
        const hoursSinceLastReward = lastReward ? (now - lastReward) / (1000 * 60 * 60) : null;
        
        // Si han pasado menos de 48 horas, continúa la racha
        if (hoursSinceLastReward && hoursSinceLastReward < 48) {
            user.dailyStreakDays += 1;
        } else if (hoursSinceLastReward && hoursSinceLastReward >= 48) {
            // Racha rota, reiniciar
            user.dailyStreakDays = 1;
        } else {
            // Primera recompensa
            user.dailyStreakDays = 1;
        }
        
        // Calcular créditos según racha (mínimo 5, máximo 25)
        const baseCredits = 5;
        const bonusCredits = Math.min(user.dailyStreakDays * 2, 20);
        const totalCredits = baseCredits + bonusCredits;
        
        // Agregar créditos
        user.credits += totalCredits;
        user.lastDailyReward = now;
        user.totalDailyRewards += totalCredits;
        await user.save();
        
        // Registrar transacción
        await CreditTransaction.create({
            user: user._id,
            type: 'DAILY_REWARD',
            amount: totalCredits,
            balanceBefore: user.credits - totalCredits,
            balanceAfter: user.credits,
            description: `Recompensa diaria - Racha de ${user.dailyStreakDays} días`,
            metadata: {
                streakDays: user.dailyStreakDays
            }
        });
        
        res.json({
            message: 'Recompensa diaria reclamada',
            credits: totalCredits,
            streakDays: user.dailyStreakDays,
            newBalance: user.credits
        });
    } catch (error) {
        console.error('Error reclamando recompensa diaria:', error);
        res.status(500).json({ error: 'Error al reclamar recompensa diaria' });
    }
});

// GET /api/user/referral - Obtener información de referidos
router.get('/referral', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('referralCode referralCount referralEarnings');
        
        // Obtener lista de usuarios referidos
        const referredUsers = await User.find({ referredBy: req.user._id })
            .select('name picture createdAt')
            .sort({ createdAt: -1 });
        
        res.json({
            referralCode: user.referralCode,
            referralLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/register?ref=${user.referralCode}`,
            referralCount: user.referralCount,
            referralEarnings: user.referralEarnings,
            referredUsers
        });
    } catch (error) {
        console.error('Error obteniendo información de referidos:', error);
        res.status(500).json({ error: 'Error al obtener información de referidos' });
    }
});

// POST /api/user/validate-referral - Validar código de referido
router.post('/validate-referral', async (req, res) => {
    try {
        const { referralCode } = req.body;
        
        if (!referralCode) {
            return res.status(400).json({ error: 'Código de referido requerido' });
        }
        
        const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() })
            .select('name picture referralCode');
        
        if (!referrer) {
            return res.status(404).json({ error: 'Código de referido inválido' });
        }
        
        res.json({
            valid: true,
            referrer: {
                name: referrer.name,
                picture: referrer.picture
            }
        });
    } catch (error) {
        console.error('Error validando código de referido:', error);
        res.status(500).json({ error: 'Error al validar código de referido' });
    }
});

// POST /api/user/apply-referral - Aplicar código de referido a usuario existente
router.post('/apply-referral', auth, async (req, res) => {
    try {
        const { referralCode } = req.body;
        const user = await User.findById(req.user._id);
        
        // Verificar que el usuario no tenga ya un referido
        if (user.referredBy) {
            return res.status(400).json({ error: 'Ya tienes un código de referido aplicado' });
        }
        
        // Buscar usuario referidor
        const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
        
        if (!referrer) {
            return res.status(404).json({ error: 'Código de referido inválido' });
        }
        
        if (referrer._id.toString() === user._id.toString()) {
            return res.status(400).json({ error: 'No puedes usar tu propio código de referido' });
        }
        
        // Aplicar referido
        user.referredBy = referrer._id;
        
        // Dar créditos de bienvenida al nuevo usuario
        const welcomeCredits = 10;
        user.credits += welcomeCredits;
        await user.save();
        
        // Dar créditos al referidor
        const referralBonus = 20;
        referrer.credits += referralBonus;
        referrer.referralCount += 1;
        referrer.referralEarnings += referralBonus;
        await referrer.save();
        
        // Registrar transacciones
        await CreditTransaction.create([
            {
                user: user._id,
                type: 'REFERRAL_BONUS',
                amount: welcomeCredits,
                balanceBefore: user.credits - welcomeCredits,
                balanceAfter: user.credits,
                description: `Bono por usar código de referido de ${referrer.name}`
            },
            {
                user: referrer._id,
                type: 'REFERRAL_REWARD',
                amount: referralBonus,
                balanceBefore: referrer.credits - referralBonus,
                balanceAfter: referrer.credits,
                description: `Recompensa por referir a ${user.name}`
            }
        ]);
        
        res.json({
            message: 'Código de referido aplicado exitosamente',
            creditsEarned: welcomeCredits,
            newBalance: user.credits
        });
    } catch (error) {
        console.error('Error aplicando código de referido:', error);
        res.status(500).json({ error: 'Error al aplicar código de referido' });
    }
});

module.exports = router;
