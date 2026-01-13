import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthRequest } from '../middleware/auth';
import { isValidEthereumAddress } from '../utils/validation';
import { resolveUsernameToAddress, checkIfBot } from '../services/polymarketService';
import { fetchProfilesFromActivities, setProfile } from '../services/polymarket/profileCache';

function isUsername(input: string): boolean {
  const trimmed = input.trim();
  return !trimmed.startsWith('0x') && trimmed.length < 42;
}

export const addAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { addresses } = req.body;
    const userId = req.userId!;

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ error: 'Addresses array is required' });
    }

    const room = await prisma.room.findUnique({ where: { id: roomId as string } });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const resolvedAddresses: string[] = [];
    const notFound: string[] = [];
    const botAddresses: string[] = [];

    for (const input of addresses) {
      const trimmed = input.trim();

      if (!trimmed) continue;

      if (isValidEthereumAddress(trimmed)) {
        // Check if this address is a bot
        const botCheck = await checkIfBot(trimmed);
        if (botCheck && botCheck.isBot) {
          botAddresses.push(trimmed);
          continue;
        }
        resolvedAddresses.push(trimmed);
        continue;
      }

      if (isUsername(trimmed)) {
        const address = await resolveUsernameToAddress(trimmed);
        if (address) {
          // Check if the resolved address is a bot
          const botCheck = await checkIfBot(address);
          if (botCheck && botCheck.isBot) {
            botAddresses.push(trimmed);
            continue;
          }
          resolvedAddresses.push(address);
        } else {
          notFound.push(trimmed);
        }
      } else {
        notFound.push(trimmed);
      }
    }

    // If any usernames couldn't be resolved, return an error
    if (notFound.length > 0) {
      return res.status(400).json({
        error: 'Could not find Polymarket users',
        notFound
      });
    }

    // If any addresses are detected as bots, return an error
    if (botAddresses.length > 0) {
      return res.status(400).json({
        error: 'Cannot add bot addresses (300+ trades/hour)',
        botAddresses
      });
    }

    // All inputs resolved successfully, add to database
    const createdAddresses = await Promise.all(
      resolvedAddresses.map(address =>
        prisma.address.upsert({
          where: { address_roomId: { address, roomId: roomId as string } },
          update: {},
          create: { address, roomId: roomId as string }
        })
      )
    );

    res.status(201).json(createdAddresses);
  } catch (error) {
    console.error('Error adding addresses:', error);
    res.status(500).json({ error: 'Failed to add addresses' });
  }
};

export const removeAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, addressId } = req.params;
    const userId = req.userId!;

    const room = await prisma.room.findUnique({ where: { id: roomId as string } });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.address.delete({ where: { id: addressId as string } });

    res.json({ message: 'Address removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove address' });
  }
};

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: roomId as string },
      include: { addresses: true },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.isPublic && room.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(room.addresses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
};

export const getAddressProfiles = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: roomId as string },
      include: { addresses: true },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.isPublic && room.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch profiles using Data API activity endpoint (avoids Gamma API ECONNRESET errors)
    const addressList = room.addresses.map(a => a.address);
    const profileMap = await fetchProfilesFromActivities(addressList);

    const addressesWithProfiles = room.addresses.map((addr) => {
      const profile = profileMap.get(addr.address.toLowerCase());
      return {
        ...addr,
        userName: profile?.name || profile?.username || null,
      };
    });

    res.json(addressesWithProfiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch address profiles' });
  }
};
