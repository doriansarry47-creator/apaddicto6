const puppeteer = require('puppeteer');

async function testAdminLogin() {
    let browser;
    
    try {
        console.log('🤖 Démarrage du test automatisé de connexion admin...');
        
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        const baseUrl = 'https://3000-ii7kjn56nxl1o3b8jakwm-5634da27.sandbox.novita.ai';
        
        console.log('📱 Navigation vers l\'application...');
        await page.goto(baseUrl, { waitUntil: 'networkidle2' });
        
        console.log('🔍 Attente de la page de connexion...');
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        
        console.log('✏️ Saisie des identifiants admin...');
        await page.type('input[type="email"]', 'doriansarry@yahoo.fr');
        await page.type('input[type="password"]', 'admin123');
        
        console.log('🚀 Clic sur le bouton de connexion...');
        await page.click('button[type="submit"]');
        
        // Attendre la redirection ou un message d'erreur
        console.log('⏳ Attente de la réponse...');
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        console.log(`📍 URL actuelle: ${currentUrl}`);
        
        // Vérifier si on est connecté (redirection vers dashboard ou home)
        if (currentUrl.includes('/login')) {
            console.log('❌ Échec de connexion - toujours sur la page de login');
            
            // Rechercher un message d'erreur
            const errorMessage = await page.$eval('.error, .alert-error, .text-red-500, .text-destructive', 
                el => el.textContent
            ).catch(() => null);
            
            if (errorMessage) {
                console.log(`❌ Message d'erreur: ${errorMessage}`);
            } else {
                console.log('❓ Pas de message d\'erreur visible');
            }
        } else {
            console.log('✅ Connexion réussie - redirection détectée');
            
            // Capturer l'écran
            await page.screenshot({ path: '/home/user/webapp/admin-dashboard.png' });
            console.log('📸 Capture d\'écran sauvée: admin-dashboard.png');
        }
        
        // Tester l'accès aux fonctionnalités admin
        console.log('🔍 Test de l\'interface admin...');
        
        // Navigation vers différentes sections
        const adminLinks = [
            '/admin',
            '/admin/dashboard', 
            '/admin/patients',
            '/admin/content-education'
        ];
        
        for (const link of adminLinks) {
            console.log(`🔗 Test de ${link}...`);
            try {
                await page.goto(`${baseUrl}${link}`, { waitUntil: 'networkidle2', timeout: 5000 });
                const title = await page.title();
                console.log(`  ✅ ${link}: ${title}`);
            } catch (error) {
                console.log(`  ❌ ${link}: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur durant le test:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Exécuter le test si ce script est appelé directement
if (require.main === module) {
    testAdminLogin();
}

module.exports = { testAdminLogin };