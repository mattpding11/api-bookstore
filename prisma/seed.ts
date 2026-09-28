import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required to run the seed script');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });


async function main(): Promise<void> {
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      {
        title: 'Biblia de jersualen',
        description: 'Presentamos la nueva edición en español de  esta BIBLIA DE JERUSALÉN. Se trata de la quinta edición que ha terminado su revisión en 2018, en continuidad con la ediciones anteriores de 1975, 1998, 2009. Se ha mantenido la tradicional fidelidad a los textos originales hebreo, arameo y griego, y la trasmisión de las introducciones y notas de la versión francesa',
        priceCents: 10000000,
        stock: 15,
        imageUrl: "https://panamericana.vtexassets.com/arquivos/ids/534821-1200-auto?v=638459416696900000&width=1200&height=auto&aspect=true",
      },
      {
        title: 'Constitución de Colombia',
        description: 'Para Nueva Legislación SAS es grato presentar la Séptima (7ª) edición de la Constitución Política de Colombia, se trata de una edición especial por su organización, estructura y contenido de la misma',
        priceCents: 5000000,
        stock: 20,
        imageUrl: 'https://panamericana.vtexassets.com/arquivos/ids/644089-1200-auto?v=639075686984300000&width=1200&height=auto&aspect=true',
      },
      {
        title: 'El arte de la guerra',
        description: 'Esta edición, anotada, con un sesudo ensayo introductorio y apéndices, presenta el cuerpo completo para entender un texto que, escrito hace más de dos mil años, goza de plena actualidad para quienes deseen ser los primeros en su campo.',
        priceCents: 7200000,
        stock: 10,
        imageUrl: "https://panamericana.vtexassets.com/arquivos/ids/590898-1200-auto?v=638821382554400000&width=1200&height=auto&aspect=true",
      },
      {
        title: 'Don quijote de la mancha',
        description: 'El Quijote es una obra maestra no ya de la literatura española sino de la literatura universal. Las múltiples interpretaciones de esa historia de un hidalgo enloquecido por la lectura de libros de caballerías son, simplemente, el reflejo de su riqueza de significados y contenidos: El Quijote, una crítica a las novelas de caballerías, o la contraposición entre el realismo, representado por el fiel escudero Sancho, y el idealismo, representado por el caballero; o la primera novela, una sátira de las ilusiones caballerescas.',
        priceCents: 8000000,
        stock: 8,
        imageUrl: "https://panamericana.vtexassets.com/arquivos/ids/319404-1200-auto?v=636907842010630000&width=1200&height=auto&aspect=true",
      },
      {
        title: 'Cien años de soledad',
        description: '«Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo. Macondo era entonces una aldea de veinte casas de barro y cañabrava construidas a la orilla de un río de aguas diáfanas que se precipitaban por un lecho de piedras pulidas, blancas y enormes como huevos prehistóricos. El mundo era tan reciente, que muchas cosas carecían de nombre, y para mencionarlas había que señalarlas con el dedo».',
        priceCents: 9000000,
        stock: 12,
        imageUrl: "https://panamericana.vtexassets.com/arquivos/ids/180124-1200-auto?v=636209752836270000&width=1200&height=auto&aspect=true",
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        description: "How did our species succeed in the battle for dominance? Why did our foraging ancestors come together to create cities and kingdoms? How did we come to believe in gods, nations and human rights? And what will our world be like in the millennia to come?",
        priceCents: 3500000,
        stock: 5,
        imageUrl: "https://panamericana.vtexassets.com/arquivos/ids/576937-1200-auto?v=638731523767200000&width=1200&height=auto&aspect=true",
        isActive: false,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
