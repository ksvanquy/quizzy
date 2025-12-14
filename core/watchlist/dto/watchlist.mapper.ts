import { Watchlist } from '../watchlist.entity';
import { WatchlistResponseDto } from './watchlist.dto';

/**
 * Watchlist Mapper - Convert between Watchlist entity and WatchlistResponseDto
 */
export class WatchlistMapper {
  /**
   * Convert Watchlist entity to WatchlistResponseDto
   */
  static toResponseDto(watchlist: Watchlist): WatchlistResponseDto {
    // Handle both populated and unpopulated quizId
    const quizId = typeof watchlist.quizId === 'object' ? watchlist.quizId : { _id: watchlist.quizId };
    
    return {
      _id: watchlist.id,
      userId: watchlist.userId,
      quizId: quizId,
      createdAt: watchlist.createdAt,
    };
  }

  /**
   * Convert array of Watchlist entities to ResponseDtos
   */
  static toResponseDtos(watchlists: Watchlist[]): WatchlistResponseDto[] {
    return watchlists.map((watchlist) => this.toResponseDto(watchlist));
  }
}
